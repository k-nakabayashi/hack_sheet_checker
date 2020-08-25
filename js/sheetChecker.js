let calc_for_sheets_Checker = (function(formId){

    
    let result_obj = {},//計算結果を格納するオブジェクト
        form_data = {},//バリデーションを通ったフォーム値
        remainder_result = {//表示結果の切り替えで使う
            "b": false,
            "c": false,
        };

    //環境変数
    let DENOMINATOR = function () {
        return 25;
    }
    let NUMERATOR = function() {
        return 435;
    }

    //ユーティリティ関数
    let setError,
        initError,
        ajaxFunc,
        pipeline,
        pipelineWithResrouce,
        setEventHandler,
        target_btn,
        getFormValues;

    //内部モジュール関数
    let sheets, 
        formComp,
        view;

    let event_btns;

//==================================================================
    let error = null,
        error_key,
        errors;

//==================================================================
//==================================================================
//==================================================================
//==================================================================
//==================================================================
    //以下、ユーティリティ
    getFormValues = function (formValue) {
        return function () {
            return formComp().getFormValues(formValue);
        }
    }

    target_btn = function(target) {
        return {
            active_flag: false,
            dom: target,
        }
    }

    setError = function (message) {
        error = message;
    }
    initError = function() {
        error = null;
    }

    ajaxFunc = function (ajaxObj) {

        let ajaxStart,
            ajaxStop;

        ajaxStart = function () {
            return ajaxObj;
        }

        ajaxStop = function () {

        }

        return {
            ajaxStart: ajaxStart,
            ajaxStop: ajaxStop,
        }
    }


    pipeline = function () {
        
        let funcs = _.toArray(arguments)

        return function () {
            
            let result = _.reduce(funcs, function(data, func){
                return func(data);
            }, {})

            return result;
        }
    }

    pipelineWithResrouce = function (resource) {
        let funcs = _.tail(arguments)[0]
        return function () {
            
            let resource_func = function (data) {
                if (resource && data) {
                    return resource(data)
                } else {
                    return data;
                }
            }

            let result = _.reduce(funcs, function(data, func) {
                if (data === false) {
                    return false;
                }

                let resource_data = resource_func(data);
                return func(resource_data);
            }, {})

            return result;
        }
    }

    setEventHandler = function(target, btn_obj) {
        let func = view().handlers[btn_obj.handler];
        return view().config.setEventHandler(target, btn_obj, func)
    }

    setBtnEvent = function (btn_obj) {

        let handler = setEventHandler(
                        target_btn($(btn_obj.dom_key)), 
                        btn_obj
                    );

        pipeline(handler)();
         
    }
    
//==================================================================
//==================================================================
//==================================================================
//==================================================================
//==================================================================
//==================================================================
    //以下、メインロジック定義

    sheets = function (target) {
     
        let baseCalc,
            calcAllSheet;
        let denominator = DENOMINATOR(),
            numerator = NUMERATOR(),
            feature;

        //==================================================================
        //==================================================================

        let command_name = "calcStart";
        let excute;

        // target = {
        //     height: values.height,
        //     width: values.height,
        // }
        excute = function (target) {
             _.map(target, function(value, key){
                return baseCalc(key, value)
           });

           calcAllSheet();

           let keys = Object.keys(result_obj);
           for (let i = 0; i < keys.length; ++i) {
            $("#js-value-" + keys[i]).text(result_obj[keys[i]])
           } 
        }

        //==================================================================
        //==================================================================
        feature = function () {
            let chooseItem = function () {

            }
            return {
                choose: choose,
                items: {
                    set12: {

                    },
                    set25: {

                    },
                    set12: {

                    },
                    set36: {

                    },
                    set48: {

                    },
                    set64: {

                    },
                }
            }
        }

        //==================================================================

        baseCalc = function (key, value) {

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
        }


        calcAllSheet = function () {
            result_obj["a"] = result_obj["x"] * result_obj["y"];
        }

        //==================================================================
        let return_obj = {};
        return_obj[command_name] = excute;
        return_obj["feature"] = feature
        return return_obj;
    }

    formComp = function () {
        
        let toHalfWidth,
            validate,
            checkType;
        //==================================================================
        //==================================================================

        let command_name = "getFormValues";

        let excute = function (retrieveFormValues) {
            let return_obj = {};
            let values = retrieveFormValues()

            _.map(values, function (value, key) {
                let result = validate(value);
                return_obj[key] = result;
            });
          
            if (error == null) {
                $(error_key).text("");
                form_data = _.clone(return_obj);
                return return_obj;
            }

            $(error_key).text(error);
            initError();

            return false;
        }

        //==================================================================
        //==================================================================
        //==================================================================
        toHalfWidth = function (string_num) {
            return string_num.replace(/./g, s => {
              return String.fromCharCode(s.charCodeAt(0) - 0xfee0)
            })
        }
    
        checkType = function (pattern, target) {
            if (pattern.test(target)) {
                return true;
            }
            return false;
        }
        
        //type=numberからの受け取り値って、何型？
        //String target 
        //return undifined or Number
        validate = function (target) {
    
            //半角数字判定
            if (checkType(/^([1-9]\d*|0)$/, target)) {
                return parseInt(target, 10);
            }
            
            //全角数字判定
            if (checkType(/^０/, target)) {
                setError(errors["ERROR1"]);
                return;
            }
            //全角数字判定
            if (checkType(/^([０-９]*)$/, target)) {
                target = toHalfWidth(target);
                return parseInt(target, 10);
            }
            
            setError(errors["ERROR1"]);
        }

        //==================================================================
        let return_obj = {};
        return_obj[command_name] = excute;
        return return_obj;
    }

//==================================================================
//==================================================================
    view = function () {

        let config,
            handlers,
            animation;
        //==================================================================
        //==================================================================
        //==================================================================
        
        //ボタンの共通ユーティリティ    
        config = {
            change_colors: function (target, colors) {

                if (!Object.keys(colors).length > 0) {
                    return
                }
            },

            toggleFlag: function (target) {
                return !target.active_flag;
            },

            setEventHandler: function (target, btn_obj, func) {
                let that = this;
                return function () {
                    target.dom.on(btn_obj.event, function() {
                        
                        func(target, btn_obj);
                        if (btn_obj.colors !=null) {
                            if (Object.keys(btn_obj.colors).length > 0) {
                                that.change_colors(target, btn_obj.colors);
                            }
                        }
                        target.active_flag = that.toggleFlag(target);
                    })
                }
            },
        }

        animation = {
          
            toggleModal: function () {
                let dom = $("#js-Modal")
                return function (data = null) {
                    dom.toggleClass("isActive");
                    return data;
                }

            },

            startLoading: function () {

                return function () {
                    
                }
            },

            stopLoading: function () {

                return function () {
                    
                }
            },
        }

        let displayResult = function () {

            return function () {
                
                let result_page = function () {
                    let b = remainder_result["b"];
                    let c = remainder_result["c"];

                    if (b === true && c === true) {
                        return {
                            title: "設置するときは...",
                            top: "適宜サイドパーツをカットして調節できます。",
                        };
                    } else if (b === false && c === false) {
                        return {
                            title: "カットするときは...",
                            top: `タテの最後のマス：${result_obj["b"]}`,
                            bottom: `ヨコの最後のマス：${result_obj["c"]}`,
                        };
                    } else {
                        return {
                            title: "カットするときは...",
                            top: `タテの最後のマス：${result_obj["b"]}`,
                            bottom: "ヨコの辺は<br>サイドパーツをカットして調節できます。",
                        };
                    }
                }();

                //枚数表示
                let number_of_sheets = result_obj["a"];
                $("#js-Num-Sheets").text(number_of_sheets);

                //面積表示
                let area = (form_data["height"] * form_data["width"]) / 1000000;
                $("#js-Sheet-Area").text(area);

                //おすすめ関連
                let feature = sheets().feature();

                //おすすめのセット
                let featured_set = feature.choose(number_of_sheets);

                //おすすめ商品リンク　周囲のサムネイル、文字もリンクにする。
                
                //最後のマス
                $("#js-Advice-Title").text(result_page["title"]);
                $("#js-Advice-Top").text(result_page["top"]);
                $("#js-Advice-Bottom").text(result_page["bottom"]);
            }
        }
        //==================================================================
        //==================================================================
        //==================================================================
        
        //クリックイベントのハンドラー
        handlers = {
            backToPage: function (target) {
                window.history.back()
            },
    
            calcNumbersOfSheets: function (target, btn_obj) {
                let form_dom = $(formId);
                let result = pipelineWithResrouce(btn_obj.resource, btn_obj.methods)();
            },

            closeModal: function (target, btn_obj) {
                console.log("closeModal")
                btn_obj.methods[0]();
            }

        }

        //==================================================================
        return {
            config: config,
            handlers: handlers,
            animation: animation,
        }
    }

 
//==================================================================
//==================================================================
//==================================================================
//==================================================================
//==================================================================

//==================================================================
    //以下、メインロジック起動
    

    error_key = "#js-Error"
    errors = {
        ERROR1: "⚠数字を入力してください。",
    }
    
    let formValue = function () {
        let height = $("#vertical").val();
        let width = $("#horizontal").val();

        return {
            height: height,
            width: width,
        }
    }

    //1. 各種ボタンのイベント設定
    let btn_colors1 = {
        true: {
            color1: "",
            color2: "",
        },

        false: {
            color1: "",
            color2: "",
        },
    }

    let btn_colors2 = {
        true: {
            color1: "",
            color2: "",
        },

        false: {
            color1: "",
            color2: "",
        },
    }

    let resource = function(data) {
        return {
            height: data.height,
            width: data.height,
        }
    }

    let modal = view().animation.toggleModal();

    event_btns = [

        {
            dom_key: "#js-Btn--forBack",
            colors: btn_colors1,
            event: "click",
            handler: "backToPage",
        },

        {
            dom_key: "#js-Btn--forCalc",
            colors: btn_colors2,
            event: "click",
            handler: "calcNumbersOfSheets",
            methods: [getFormValues(formValue), modal, sheets().calcStart,]
        },

        {
            dom_key: "#js-Close-Modal",
            event: "click",
            handler: "closeModal",
            methods: [modal]
        }
    ]


    _.map(event_btns, function (btn) {
        setBtnEvent(btn);
    });

    //2. 処理中断系

    
})("#calc_for_sheets_Checker");