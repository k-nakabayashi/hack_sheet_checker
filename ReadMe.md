# マークアップ


## ブレイクポイント
@mixin media-md：IPad縦以上
@mixin media-md-max：IPad縦未満

## 横幅 : max-width: 1024px;
.u-Container: max-width: 1024px;

## アニメーション

モーダル
- .m-Modal.isActive：モーダル起動時

ローディング
- .m-Modal__inner.isLoading：ローディング起動時

ボタン
- .a-Btn.withChange.forBack：「商品ページに戻る」ボタン
- .a-Btn.withChange.forCalc：「必要枚数を計算する」

- 以下のようにどちらのボタンにもアニメーションを付けてます。

```css
@include media-md-max(){
    &:active {
        @include btnAnime();
    }
}
@include media-md() {
    &:hover {
        @include btnAnime();
    }
}
```

## jQueryのDOM操作
いずれもidに「js-」という接頭語を使っております。

モーダル系
- #js-Active-Area
- モーダル起動時に,isActiveを付与
- IPad以上の時、モーダル内の横幅を調整

エラー
- #js-Error, #js-Error-forHeight, #js-Error-forWidth
- エラーメッセージを表示


```javascript
//モーダル内部の計算結果を表示
targetDom = (function () {
    return {
        advice_title_dom: $("#js-Advice-Title"),
        advice_top: $("#js-Advice-Top"),
        advice_bottom: $("#js-Advice-Bottom"),
        number_of_sheets: $("#js-Num-Sheets"),
        area: $("#js-Sheet-Area"),
        link_top: $("#js-Feature-Link--forTop"),
        link_bottom: $("#js-Feature-Link--forBottom"),
        thumb: $("#js-Thumb"),
        pannel: $("#js-Pannel-Img"),
    }
}());
```

```javascript
//モーダルの開閉と、モーダルtop位置をレスポンシブ
toggleModal: function () {
    let header_dom = $("#js-Header");
    let wrapper_dom = $("#js-Active-Area")
    let dom = $("#js-Modal");

    return function (data) {
        
        header_dom.toggleClass("isActive");
        wrapper_dom.toggleClass("isActive")

        wrapper_dom.children().css({
            "top": `${header_dom.height() - 1}px`,
        });
        dom.toggleClass("isActive");
        open_modal_flag = open_modal_flag? false: true;
        return data;
    }

},
```

```javascript
//ローディングのハンドリング
loading: function() {
    let dom = $("#js-Loading");
    let start = function () {
        console.log("anime start");
        $("#js-Loading").addClass("isLoading");
    }
    let stop = function () {
        console.log("anime stop")
        $("#js-Loading").removeClass("isLoading");
        
    }
    return function () {
        return {
            start: start,
            stop: stop,
        }
    }
},
```





# 計算のテスト

```javascript

//一辺の枚数
result1 = ( input - 25 )/435;

//一辺の枚数の余り
result2 = ( input - 25 )%435;

input >= 0;
result1, result2 >= 0;

```

Zの境界値
- 25と435

result1は枚数なので、絶対に正の数する。
→ input >= 25

## テスト

inputのテスト
```
異常：-10, 0, 12, 24
正常：25, 26,  200, 434, 435, 436
```




# 入力値の渡り方
```html
<div class="input-area">
    <p>
        <label>❶</label>
        <input type="text" id="height" size="10" maxlength="8" value="0">mm
    </p>
    <p>
        <label>❷</label>
        <input type="text" id="width" size="10" maxlength="8" value="0">mm
    </p>
    <p class="a-Text" id="js-Error"></p>
</div>
```

```javascript
let result_obj = {},//計算結果を格納するオブジェクト
    form_data = {},//バリデーションを通ったフォーム値
    remainder_result = {
        "b": false,
        "c": false,
    },
.
.
.

//フォームの値を取得:form_dataに格納される
let formValue = function () {
    let height = $("#height").val();
    let width = $("#width").val();

    return {
        height: height,
        width: width,
    }
}
```

```javascript
//各種計算
//上で宣言したresult_obj(計算結果)とremainder_result(余り結果)に格納
//form_dataのkeyとvalueが渡されます。
baseCalc: function (key, value) {
    
    ////////////////////////////////////////////////
    // %435
    let remainder = (value - denominator)% numerator;

    if (key == "height") {
        result_obj["b"] = remainder;
    
    } else if (key == "width") {
        result_obj["c"] = remainder;
    }

    ////////////////////////////////////////////////
    // /435
    let base = (value - denominator)/ numerator;
    let remainder_flag = false;

    if (remainder <= 10) {
        remainder_flag = true;
        base = Math.floor(base);
    } else {
        base = Math.ceil(base);
    }
    
    if (key == "height") {
        result_obj["x"] = base;
    
    } else if (key == "width") {
        result_obj["y"] = base;
    }

    ////////////////////////////////////////////////
    if (key == "height") {
        remainder_result["b"] = remainder_flag;
    
    } else if (key == "width") {
        remainder_result["c"] = remainder_flag;
    }
},
```

#　コードについて

```javascript
//イベントのハンドラーを設定しています。
view = function () {
    .
    .
    .
    handlers = {
        closeModal: function (target, btn_obj) {
            pipeline.apply(null, btn_obj.methods)();
            initAdviceDom();
        }
        .
        .
        .
    }
    .
    .
    .
}
.
.
.
//ボタンにeventとhandlerを設定して
//handlerの中で、起動するコールバークをmethodsで設定できます。
//そのmethodsをpipeline()で使うと楽です。
event_btns = [

    {
        dom_key: "#js-Btn--forBack",
        event: "click",
        handler: "backToPage",
    },

    {
        dom_key: "#js-Btn--forCalc",
        event: "click",
        handler: "calcNumbersOfSheets",
        resource: resource,//methodsで使う共通の引数の型
        methods: [getFormValues(formValue), checkParseResult, modalWrapper, sheets(innerProcess).calcStart]
    },
    {
        dom_key: "#js-Close-Modal",
        event: "click",
        handler: "closeModal",
        methods: [stopCalc(), modal]
    }
]
```