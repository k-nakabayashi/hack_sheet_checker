let calc_for_sheets_Checker = (function(formId){

    //計算結果を格納するオブジェクト
    let result_obj = {}
    
    //環境変数
    let error;
    let DENOMINATOR = function () {
        return 25;
    }
    let NUMERATOR = function() {
        return 435;
    }

    //ユーティリティ関数
    let setError,
        ajaxFunc,
        pipeline,
        pipelineWithResrouce,
        setEventHandler,
        target_btn,
        getFormValues;

    //内部モジュール関数
    let sheetsCalc, 
        formComp,
        view;

    let evet_btns;

//==================================================================
    let ERROR1 = "値を入力してください。",
        ERROR2 = "値を入力してください。";

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

            let result = _.reduce(funcs, function(data, func){
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

    sheetsCalc = function (target) {
     
        let baseCalc,
            remainderCalc,
            calcAllSheet;
        let denominator = DENOMINATOR();
        let Numerator = NUMERATOR();
        //==================================================================
        //==================================================================

        let command_name = "start";
        let excute;

        // target = {
        //     height: values.height,
        //     width: values.height,
        // }
        excute = function (target) {
            console.log(command_name)
            console.log(target)

            //xとy
            
             _.map(target, function(value, key){
                return baseCalc(key, value)
           });

           //bとc: 余りのの処理
           _.map(target,function(value, key){
            return remainderCalc(key, value);
           })
           
           calcAllSheet();

           console.log(result_obj)
           let keys = Object.keys(result_obj);
           for (let i = 0; i < keys.length; ++i) {
            $("#js-value-" + keys[i]).text(result_obj[keys[i]])
           } 
            //    return result
            return
        }

        //==================================================================
        //==================================================================
        //==================================================================

        baseCalc = function (key, value) {
            let result = (value - denominator)/ Numerator;

            if (key == "height") {
                result_obj["x"] = result;
            
            } else if (key == "width") {
                result_obj["y"] = result;
            }
            
        }

        remainderCalc = function (key, value) {
            let result = (value - denominator)% Numerator;

            if (key == "height") {
                result_obj["b"] = result;
            
            } else if (key == "width") {
                result_obj["c"] = result;
            }
        }

        calcAllSheet = function () {
            result_obj["a"] = result_obj["x"]*result_obj["y"];
        }

        //==================================================================
        let return_obj = {};
        return_obj[command_name] = excute;
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

            _.map( retrieveFormValues(), function (value, key) {
                let result = validate(value);
                return_obj[key] = result;
            });
 
            if (error == null) {
                return return_obj;
            }
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
            let retsult = false;
    
            if (RegExp(pattern)) {
                retsult = true;
            }
            
            return retsult;
        }
        
        //type=numberからの受け取り値って、何型？
        //return undifined or Number
        validate = function (target) {

           return target;
            // //文字列に変換
            
            // //半角数字判定
            // if (checkType("/[1-9]/", target)) {
            //     return parseInt(target, 10)
                
            // }
            // //全角数字判定
            // if (checkType("/[１-9]/", target)) {
            //     target = toHalfWidth(target)
            //     return parseInt(target, 10);
            // }
            
            // setError(ERROR1);
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
            handlers;
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
                        that.change_colors(target, btn_obj.colors);
                        target.active_flag = that.toggleFlag(target);
                    })
                }
            },
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
    
            loadingAnime: function () {
                
                let start,
                    stop;
    
                return {
                    start: start,
                    stop: stop,
                }
            },
        }

        //==================================================================
        return {
            config: config,
            handlers: handlers,
        }
    }

 
//==================================================================
//==================================================================
//==================================================================
//==================================================================
//==================================================================

//==================================================================
    //以下、メインロジック起動

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

    evet_btns = [

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
            methods: [getFormValues(formValue), sheetsCalc().start]
        }
    ]


    _.map(evet_btns, function (btn) {
        setBtnEvent(btn);
    });

    //2. 処理中断系

    
})("#calc_for_sheets_Checker");