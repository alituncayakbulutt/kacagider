#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import html
import json
import re
import subprocess
import time
import unicodedata
import urllib.parse
import urllib.request
import urllib.robotparser
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "donanimhaber-market-source.json"
OUTPUT_PATH = ROOT / "data" / "market-observations" / "inbox" / "_runtime-donanimhaber.json"
REPORT_DIR = ROOT / "reports" / "price-monitor"

HREF_RE = re.compile(r"href=[\"']([^\"']+)[\"']", re.I)
RAW_TOPIC_RE = re.compile(r"(?:https?:)?//forum\.donanimhaber\.com(/[^\s\"'<>]+--\d{6,}(?:-\d+)?)", re.I)
REL_TOPIC_RE = re.compile(r"(/[A-Za-z0-9%._~!$&()*+,;=:@/\-]+--\d{6,}(?:-\d+)?)", re.I)
TOPIC_ID_RE = re.compile(r"--(\d{6,})")
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
STORAGE_RE = re.compile(r"(?<!\d)(\d+(?:[.,]\d+)?)\s*(TB|GB)\b", re.I)
PRICE_WITH_UNIT_RE = re.compile(r"(?<!\d)(\d{1,3}(?:[.\s]\d{3})+|\d{4,6})\s*(?:TL|₺|lira(?:dır|dir|dır|dir)?)\b", re.I)
NUMBER_RE = re.compile(r"(?<!\d)(\d{1,3}(?:[.\s]\d{3})+|\d{4,6})(?!\d)")
DATE_RE = re.compile(r"\b(\d{1,2})\s+(Ocak|Şubat|Subat|Mart|Nisan|Mayıs|Mayis|Haziran|Temmuz|Ağustos|Agustos|Eylül|Eylul|Ekim|Kasım|Kasim|Aralık|Aralik)\s+(20\d{2})\b", re.I)
MONTHS = {"ocak":1,"subat":2,"mart":3,"nisan":4,"mayis":5,"haziran":6,"temmuz":7,"agustos":8,"eylul":9,"ekim":10,"kasim":11,"aralik":12}


class TextCollector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts=[]
        self.skip=0
    def handle_starttag(self, tag, attrs):
        tag=tag.lower()
        if tag in {"script","style","noscript","svg"}: self.skip+=1
        elif not self.skip and tag in {"br","p","div","li","h1","h2","h3","section","article","tr"}: self.parts.append("\n")
    def handle_endtag(self, tag):
        tag=tag.lower()
        if tag in {"script","style","noscript","svg"}:
            if self.skip: self.skip-=1
        elif not self.skip and tag in {"p","div","li","h1","h2","h3","section","article","tr"}: self.parts.append("\n")
    def handle_data(self, data):
        if not self.skip and data: self.parts.append(data)
    def lines(self):
        text=html.unescape("".join(self.parts))
        return [re.sub(r"\s+"," ",x).strip() for x in text.splitlines() if x.strip()]


def load_json(path): return json.loads(Path(path).read_text(encoding="utf-8"))

def normalize_text(value):
    text=str(value or "").strip().casefold()
    text=unicodedata.normalize("NFKD",text)
    text="".join(ch for ch in text if not unicodedata.combining(ch))
    text=text.translate(str.maketrans({"ı":"i","ş":"s","ğ":"g","ü":"u","ö":"o","ç":"c"}))
    text=re.sub(r"[^a-z0-9]+"," ",text)
    return re.sub(r"\s+"," ",text).strip()

def normalize_storage(value):
    raw=str(value or "").strip().lower().replace(",",".")
    m=re.search(r"(\d+(?:\.\d+)?)\s*(tb|gb)?",raw)
    if not m: return None
    n=float(m.group(1)); unit=m.group(2) or "gb"
    return str(int(round(n*1024 if unit=="tb" else n)))

def parse_number(token):
    try: return int(str(token).replace(" ","").replace(".",""))
    except Exception: return None


def extract_phone_prices():
    js=ROOT/"data"/"phone-prices.js"
    code=r'''const fs=require('fs');const vm=require('vm');const src=fs.readFileSync(process.argv[1],'utf8');const sandbox={console};sandbox.window=sandbox;sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(src,sandbox,{filename:process.argv[1]});process.stdout.write(vm.runInContext('JSON.stringify(PHONE_PRICE_DATA)',sandbox));'''
    p=subprocess.run(["node","-e",code,str(js)],check=True,capture_output=True,text=True,cwd=ROOT)
    return json.loads(p.stdout)

def catalog_signatures(data):
    out=[]
    for brand,models in (data or {}).items():
        if not isinstance(models,dict): continue
        for model,storages in models.items():
            if not isinstance(storages,dict): continue
            out.append({"brand":brand,"model":model,"brand_n":normalize_text(brand),"model_n":normalize_text(model),"storages":{normalize_storage(s) for s in storages if normalize_storage(s)}})
    return sorted(out,key=lambda x:len(x["model_n"]),reverse=True)


def fetch_text(url, cfg):
    req=urllib.request.Request(url,headers={"User-Agent":cfg["user_agent"],"Accept":"text/html,application/xhtml+xml;q=0.9,*/*;q=0.8","Accept-Language":"tr-TR,tr;q=0.9,en;q=0.5","Cache-Control":"no-cache"})
    with urllib.request.urlopen(req,timeout=float(cfg["timeout_seconds"])) as r:
        data=r.read(int(cfg["max_bytes"])+1)
        if len(data)>int(cfg["max_bytes"]): raise RuntimeError("response_too_large")
        return data.decode(r.headers.get_content_charset() or "utf-8",errors="replace"),int(getattr(r,"status",200) or 200)

def robots_allowed(url,cfg):
    p=urllib.parse.urlsplit(url); robots=urllib.parse.urlunsplit((p.scheme,p.netloc,"/robots.txt","",""))
    try: raw,_=fetch_text(robots,cfg)
    except Exception as exc: return False,f"robots_unavailable:{type(exc).__name__}"
    rp=urllib.robotparser.RobotFileParser(); rp.set_url(robots); rp.parse(raw.splitlines())
    ok=rp.can_fetch(cfg["user_agent"],url)
    return ok,"robots_allow" if ok else "robots_disallow"


def canonical_topic_url(candidate,base_url):
    candidate=html.unescape(candidate).replace("\\/","/")
    url=urllib.parse.urljoin(base_url,candidate)
    p=urllib.parse.urlsplit(url)
    if p.netloc.casefold()!=urllib.parse.urlsplit(base_url).netloc.casefold(): return None
    m=TOPIC_ID_RE.search(p.path)
    if not m: return None
    end=m.end()
    path=p.path[:end]
    if "--f" in path.casefold(): return None
    return urllib.parse.urlunsplit((p.scheme,p.netloc,path,"",""))

def discover_links(raw_html,base_url,limit):
    prepared=html.unescape(raw_html).replace("\\/","/").replace("\\u002F","/").replace("\\u002f","/")
    candidates=[]
    candidates.extend(HREF_RE.findall(prepared))
    candidates.extend("https://forum.donanimhaber.com"+x for x in RAW_TOPIC_RE.findall(prepared))
    candidates.extend(REL_TOPIC_RE.findall(prepared))
    out=[]; seen=set(); samples=[]
    for c in candidates:
        if len(samples)<12 and "--" in c: samples.append(c[:220])
        u=canonical_topic_url(c,base_url)
        if not u or u in seen: continue
        seen.add(u); out.append(u)
        if len(out)>=limit: break
    return out,samples


def page_title(raw):
    m=TITLE_RE.search(raw)
    if not m: return ""
    return re.sub(r"\s+"," ",re.sub(r"<[^>]+>"," ",html.unescape(m.group(1)))).strip()

def match_model(text, signatures):
    n=" "+normalize_text(text)+" "
    for item in signatures:
        model=item["model_n"]
        if model and (" "+model+" ") in n:
            if (model.isdigit() or len(model)<=4) and (" "+item["brand_n"]+" ") not in n: continue
            return item
    return None

def storage_from_text(text,allowed):
    for m in STORAGE_RE.finditer(text or ""):
        s=normalize_storage(f"{m.group(1)} {m.group(2)}")
        if s in allowed: return s
    return None


def parse_price(lines,minimum,maximum):
    preferred=[]; generic=[]
    for i,line in enumerate(lines):
        n=normalize_text(line)
        values=[]
        for m in PRICE_WITH_UNIT_RE.finditer(line):
            v=parse_number(m.group(1))
            if v is not None and minimum<=v<=maximum: values.append(v)
        if "fiyat" in n:
            for m in NUMBER_RE.finditer(line):
                v=parse_number(m.group(1))
                if v is not None and minimum<=v<=maximum: values.append(v)
        target=preferred if "fiyat" in n else generic
        for v in values: target.append((i,v))
    pool=preferred or generic
    if not pool: return None
    vals=sorted(v for _,v in pool)
    return vals[len(vals)//2]

def post_date(text):
    m=DATE_RE.search(text)
    if not m: return None
    month=MONTHS.get(normalize_text(m.group(2)))
    if not month: return None
    try: return dt.datetime(int(m.group(3)),month,int(m.group(1)),tzinfo=dt.timezone.utc)
    except ValueError: return None


def classify_rejection(title,lines):
    head=normalize_text(title+" "+" ".join(lines[:80]))
    if "ilan turu alinik" in head or normalize_text(title).startswith("alinik "): return "wanted_listing"
    if "sifir urun evet" in head or "kapali kutu" in normalize_text(title): return "new_or_sealed"
    title_n=normalize_text(title)
    if re.search(r"\byd\b",title_n) or "yurt disi" in title_n or "kayitsiz" in head or "pasaport kayitli" in head: return "non_standard_registration"
    return None


def listing_observation(url,raw,signatures,cfg,now):
    parser=TextCollector()
    try: parser.feed(raw)
    except Exception: pass
    lines=parser.lines(); title=page_title(raw)
    rejection=classify_rejection(title,lines)
    if rejection: return None,rejection
    model=match_model(title,signatures)
    if not model:
        for line in lines[:120]:
            model=match_model(line,signatures)
            if model: break
    if not model: return None,"model_not_found"
    storage=storage_from_text(title,model["storages"])
    if not storage:
        for line in lines[:160]:
            if model["model_n"] in normalize_text(line):
                storage=storage_from_text(line,model["storages"])
                if storage: break
    if not storage: return None,"storage_not_found"
    price=parse_price(lines,int(cfg["collection"]["minimum_price_tl"]),int(cfg["collection"]["maximum_price_tl"]))
    if price is None: return None,"price_not_found"
    text="\n".join(lines[:260]); status=normalize_text(title+" "+text)
    sold="satildi" in status or "forum disina satildi" in status or "dh forum uzerinden satilmistir" in status
    observed=now
    if sold:
        d=post_date(text)
        if d: observed=d
    m=TOPIC_ID_RE.search(urllib.parse.urlsplit(url).path)
    return {"source_id":cfg["source_id"],"source_item_id":m.group(1) if m else url,"source_url":url,"observation_type":"sold" if sold else "asking","category":"phone","brand":model["brand"],"model":model["model"],"storage":f"{storage} GB","price":int(price),"observed_at":observed.isoformat().replace("+00:00","Z"),"market_status":"sold" if sold else "active"},None


def main():
    cfg=load_json(CONFIG_PATH); safety=cfg.get("safety",{})
    if cfg.get("mode")!="dry-run" or safety.get("allow_live_price_write") or safety.get("allow_supabase_write"): raise SystemExit("Guvenlik: sadece dry-run.")
    request_cfg=cfg["request"]; signatures=catalog_signatures(extract_phone_prices()); now=dt.datetime.now(dt.timezone.utc).replace(microsecond=0)
    observations=[]; pages=[]; rejected={}
    for category_url in cfg.get("category_urls",[]):
        row={"category_url":category_url,"status":"pending","detail_links":0,"observations":0,"href_samples":[]}
        try:
            if safety.get("respect_robots_txt",True):
                ok,reason=robots_allowed(category_url,request_cfg); row["robots_status"]=reason
                if not ok: row["status"]=reason; pages.append(row); continue
            raw,http_status=fetch_text(category_url,request_cfg); row["http_status"]=http_status
            links,samples=discover_links(raw,category_url,int(cfg["collection"]["maximum_detail_pages"])); row["detail_links"]=len(links); row["href_samples"]=samples
            for idx,url in enumerate(links):
                if len(observations)>=int(cfg["collection"]["maximum_observations"]): break
                try:
                    detail,_=fetch_text(url,request_cfg); obs,reason=listing_observation(url,detail,signatures,cfg,now)
                    if obs: observations.append(obs)
                    else: rejected[reason]=rejected.get(reason,0)+1
                except Exception as exc:
                    key=f"detail_fetch_{type(exc).__name__}"; rejected[key]=rejected.get(key,0)+1
                if idx+1<len(links): time.sleep(float(request_cfg.get("delay_between_requests_seconds",0.8)))
            row["observations"]=len(observations); row["status"]="ok"
        except Exception as exc:
            row["status"]=f"fetch_error:{type(exc).__name__}"; row["error"]=str(exc)[:250]
        pages.append(row)
    unique=[]; seen=set()
    for obs in observations:
        key=(obs["source_item_id"],obs["brand"],obs["model"],obs["storage"],obs["price"])
        if key in seen: continue
        seen.add(key); unique.append(obs)
    OUTPUT_PATH.parent.mkdir(parents=True,exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps({"phase":"3b","mode":"dry-run","generated_at_utc":now.isoformat().replace("+00:00","Z"),"observations":unique},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    active=sum(1 for x in unique if x["market_status"]=="active"); sold=sum(1 for x in unique if x["market_status"]=="sold")
    report={"phase":"3b","mode":"dry-run","source_id":cfg["source_id"],"generated_at_utc":now.isoformat().replace("+00:00","Z"),"summary":{"observations":len(unique),"active":active,"sold":sold,"rejected":rejected},"pages":pages,"safety":{"live_price_mutation":False,"supabase_mutation":False,"login_or_captcha_bypass":False,"robots_txt_respected":bool(safety.get("respect_robots_txt",True))}}
    REPORT_DIR.mkdir(parents=True,exist_ok=True)
    (REPORT_DIR/"donanimhaber-source-latest.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    md=["# KaçaGider Faz 3B — DonanımHaber İkinci El Kaynağı","","- Mod: **dry-run / canlı fiyat yazımı kapalı**",f"- Toplanan gözlem: **{len(unique)}**",f"- Aktif ilan: **{active}**",f"- Satıldı işaretli ilan: **{sold}**",f"- Reddedilenler: `{json.dumps(rejected,ensure_ascii=False)}`","- Alınık, kapalı kutu/sıfır ve standart dışı kayıt ilanları filtrelenir.","- Giriş/captcha aşılmaz; robots.txt kuralları uygulanır."]
    (REPORT_DIR/"donanimhaber-source-latest.md").write_text("\n".join(md)+"\n",encoding="utf-8")
    print(json.dumps(report["summary"],ensure_ascii=False,indent=2)); print(f"Runtime input: {OUTPUT_PATH.relative_to(ROOT)}")

if __name__=="__main__": main()
