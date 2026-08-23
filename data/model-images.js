(function(global){
  "use strict";
  const APPLE={
    "iPhone 11":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/identify-iphone-11-colors.jpg",
    "iPhone 11 Pro":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/identify-iphone-11pro.jpg",
    "iPhone 11 Pro Max":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/identify-iphone-11pro-max.jpg",
    "iPhone SE (2. nesil)":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-se/iphone-se-2nd-gen-colors.jpg",
    "iPhone 12 mini":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/2021-iphone12-mini-colors.png",
    "iPhone 12":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/2021-iphone12-colors.png",
    "iPhone 12 Pro":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-12-pro/iphone12-pro-colors.jpg",
    "iPhone 12 Pro Max":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-12-pro-max/iphone12-pro-max-colors.jpg",
    "iPhone 13 mini":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/2022-iphone13-mini-colors.png",
    "iPhone 13":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/2022-spring-iphone13-colors.png",
    "iPhone 13 Pro":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/2022-spring-iphone13-pro-colors.png",
    "iPhone 13 Pro Max":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/2022-spring-iphone13-pro-max-colors.png",
    "iPhone SE (3. nesil)":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-se-3rd-gen-colors.png",
    "iPhone 14":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-14-colors-spring-2023.png",
    "iPhone 14 Plus":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-14-plus-colors-spring-2023.png",
    "iPhone 14 Pro":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-14-pro-colors.png",
    "iPhone 14 Pro Max":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-14-pro-max-colors.png",
    "iPhone 15":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/fall-2023-iphone-colors-iphone-15.png",
    "iPhone 15 Plus":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/fall-2023-iphone-colors-iphone-15-plus.png",
    "iPhone 15 Pro":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/fall-2023-iphone-colors-iphone-15-pro.png",
    "iPhone 15 Pro Max":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/fall-2023-iphone-colors-iphone-15-pro-max.png",
    "iPhone 16":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-16-colors.png",
    "iPhone 16 Plus":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-16-plus-colors.png",
    "iPhone 16 Pro":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-16-pro-colors.png",
    "iPhone 16 Pro Max":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-16-pro-max-colors.png",
    "iPhone 16e":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-16e/iphone-16e-colors.png",
    "iPhone 17":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-colors.png",
    "iPhone 17 Pro":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-colors.png",
    "iPhone 17 Pro Max":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-max-colors.png",
    "iPhone Air":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-air-colors.png",
    "iPhone 17e":"https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17e/iphone-17e-colors.png"
  };

  const DATA={Apple:APPLE};

  function getModelImage(brand,model){
    brand=String(brand||"").trim();
    model=String(model||"").trim();
    return DATA[brand]&&DATA[brand][model] ? DATA[brand][model] : "";
  }

  global.KG_MODEL_IMAGE_DATA=DATA;
  global.getKgModelImage=getModelImage;
})(window);
