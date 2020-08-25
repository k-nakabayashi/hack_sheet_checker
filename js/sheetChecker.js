let calc_for_sheets_Checker = (function(formId){

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
        setEventHandler,
        target_btn;

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

    let pipelineWithResrouce = function (resource) {
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
                let resource = resource_func(data);
                return func(resource);
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

        let pipe = pipeline(handler)();
         
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
            remainderCalc;
        let denominator = DENOMINATOR();
        let Numerator = NUMERATOR();
        //==================================================================
        //==================================================================

        let command_name = "start";
        let excute;
        
        excute = function (target) {
            console.log(command_name);
            // target = {
            //     height: values.height,
            //     width: values.height,
            // }

            //xとy
            let base_data = _.map(target, function(key, value){
                return baseCalc(key, value)
           });

           //bとc: 余りのの処理
           let remainder_calc = _.map(target,function(key, value){
            return remainderCalc(key, value);
           })

            //    return result
            return
        }

        //==================================================================
        //==================================================================
        //==================================================================

        baseCalc = function (key, value) {
            let obj = {};
            obj[key] = (value - denominator)/ Numerator;
            return obj;
        }

        remainderCalc = function (key, value) {
            let obj = {};
            obj[key] = (value - denominator)% Numerator;
            return obj;
        }

        //==================================================================
        let return_obj = {};
        return_obj[command_name] = excute;
        return return_obj;
    }

    formComp = function () {
        
        let toHalfWidth,
            validate,
            checkType,
            retrieveFormValues;
        //==================================================================
        //==================================================================

        let command_name = "getFormValues";
        let excute = function () {
            console.log(command_name);
            let values = _.map( retrieveFormValues(), validate);
            
            if (!error) {
                return {
                    height: values.height,
                    width: values.height,
                }
            }
        }

        //==================================================================
        //==================================================================
        //==================================================================
         //クロージャー内のフォームの値を更新
        retrieveFormValues = function () {
            let height = $("#vertical").val();
            let width = $("#horizontal").val();

            return {
                height: height,
                width: width,
            }
        }

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

           
            //文字列に変換
            
            //半角数字判定
            if (checkType("/[1-9]/", target)) {
                return parseInt(target, 10)
                
            }
            //全角数字判定
            if (checkType("/[１-9]/", target)) {
                target = toHalfWidth(target)
                return parseInt(target, 10);
            }
            
            setError(ERROR1);
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
            methods: [formComp().getFormValues, sheetsCalc().start]
        }
    ]


    _.map(evet_btns, function (btn) {
        setBtnEvent(btn);
    });

    //2. 処理中断系

    
})("#calc_for_sheets_Checker");