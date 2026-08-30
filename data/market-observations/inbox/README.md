# KaçaGider piyasa gözlem inbox

Bu klasör Faz 2 piyasa gözlem motorunun **salt-okuma girdisi**dir.

- Her `.json` dosyası tek bir gözlem nesnesi, bir gözlem dizisi veya `{ "observations": [...] }` biçiminde olabilir.
- Girdiler `observation.schema.json` alanlarını izlemelidir.
- Bu klasöre eklenen veri canlı fiyatı doğrudan değiştirmez.
- Motor en az 5 geçerli gözlem ve en az 3 bağımsız kaynak olmadan aday fiyat üretmez.
- 21 günden eski gözlemler, geçersiz fiyatlar, katalogla eşleşmeyen modeller ve uç değerler otomatik dışarıda bırakılır.
- `external_listing` ve `corporate_buy` kaynakları doğrulanana kadar config içinde kapalıdır.

Canlı fiyat yazma Faz 2 boyunca kapalıdır.
