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