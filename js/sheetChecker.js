let calc_for_sheets_Checker = (function(){

    
    //かなり重要な共通オブジェクト：そこらかしこで利用する。

    let result_obj = {},//計算結果を格納するオブジェクト
        form_data = {},//バリデーションを通ったフォーム値
        remainder_result = {//表示結果の切り替えで使う
            "b": false,
            "c": false,
        },
        start_deffered_obj = null,
        time_func = null,
        open_modal_flag = false,
        modalContent = null,
        calc_process_flag = false,
    
    //ユーティリティ関数
        displayNoError,
        displayError,
        setError,
        initError,
        pipeline,
        pipelineWithResrouce,
        setEventHandler,
        target_btn,
        getFormValues,
        setBtnEvent,
        stopCalc,

    //内部モジュール関数
        sheets, 
        formComp,
        view,
        asyncProccess,
        sheets_utils,

    //内部モジュールのオブジェクト
        view_obj,
        formComp_obj,
        sheets_utils_obj,
        asyncProccess_obj,

    //起点となるボタン
        event_btns,

    //エラー
        error = null,
        error_for_pc,
        error_key,
        errors,

    //その他
        featureSet,
        DENOMINATOR = function () {
            return 25;
        },
         NUMERATOR = function() {
            return 435;
        };
//==================================================================
//==================================================================
//==================================================================
//==================================================================
//==================================================================
    //ユーティリティ
    getFormValues = function (formValue) {
        return function () {
            return formComp_obj.getFormValues(formValue);
        }
    }

    target_btn = function(target) {
        return {
            active_flag: false,
            dom: target,
        }
    }
    
    displayNoError = function () {
        $(error_key).text("");
        _.map(error_for_pc, function(target){
            $(target.key).text("");
        })
    }

    displayError = function () {
        $(error_key).text(error);
        _.map(error_for_pc, function(target){
            console.log($(target.key));
            $(target.key).text(target.message);
        })
        calc_process_flag = false;
        initError();
    }

    setError = function (message, target = null) {
        error = "両辺共に" + message;
        if (target != null) {
            error_for_pc[target]["message"] = message;
        }
    }

    initError = function() {
        error = null;
        error_for_pc = {
            height: {
                key: "#js-Error-forHeight",
                message: "",
            },
            width: {
                key: "#js-Error-forWidth",
                message: "",
            }
        };
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

        let funcs = _.tail(arguments)[0];

        return function () {

            let result = _.reduce(funcs, function(data, func) {
                if (data === false) {
                    return false;
                }

                let resource_data = resource(data);
                return func(resource_data);
            }, {})

            return result;
        }
    }

    setEventHandler = function(target, btn_obj) {
        let func = view_obj.handlers[btn_obj.handler];
        return view_obj.config.setEventHandler(target, btn_obj, func)
    }

    setBtnEvent = function (btn_obj) {

        let handler = setEventHandler(
                        target_btn($(btn_obj.dom_key)), 
                        btn_obj
                    );

        pipeline(handler)();
         
    }
    
    stopCalc = function () {
        return function () {
            if (start_deffered_obj["reject"]) {
                start_deffered_obj.reject();
                start_deffered_obj = null;
                clearTimeout(time_func);
                time_func = null;
                calc_process_flag = false;
            }
        }
    }


//==================================================================
//==================================================================

    //非同期処理
    asyncProccess = function () {
        
        let aysncP,
            process,
            reject,
            startProcess;

        aysncP = function (fook_func) {
            let innerFuncs = _.tail(arguments);
            start_deffered_obj = $.Deferred();
            process(start_deffered_obj)(fook_func, innerFuncs);

            return start_deffered_obj.promise();

        }

        process = function(d) {

            return function (main_logic) {
                let innerFuncs = _.tail(arguments)[0][0];
                dalay = main_logic.delay()? main_logic.delay(): delay;
                console.log("非同期処理：開始")
                
                time_func = setTimeout(function(){
                    //計算処理色々
                    main_logic.execute();
                    _.map(innerFuncs, function(func){
                        func()
                    })
                    console.log("非同期処理：完了")
                    d.resolve()
                }, main_logic.delay())
            }
        }

        reject = function() {
            return false;
        }

        startProcess = async function (anime, fook_func, innet_funcs) {
            let animation = anime();
            animation.start()

            let base_promise_obj = aysncP(fook_func, innet_funcs)

            base_promise_obj
            .fail(reject())
            .always(animation.stop);

            return base_promise_obj;
        }


        return {
            start: startProcess
        }
    }


//==================================================================
//==================================================================

    //executeモジュール
    sheets = function (inner_process) {

        //==================================================================
        //==================================================================

        let command_name = "calcStart";
        let excute;

        // target = {
        //     height: values.height,
        //     width: values.height,
        // }
        excute = function (/**target**/) {
            inner_process(sheets_utils_obj.process.calc)
        }
        
        let return_obj = {};
        return_obj[command_name] = excute;
        return return_obj;
    }

    sheets_utils = function() {
        let denominator = DENOMINATOR(),
            numerator = NUMERATOR();

        let utils =  {
            process: {
                calc: {
                    execute: function () {
                        console.log("process : calc")
                        _.map(form_data, function(value, key){
                            return utils.baseCalc(key, value)
                        });

                        utils.calcAllSheet();

                        let keys = Object.keys(result_obj);
                        for (let i = 0; i < keys.length; ++i) {
                        $("#js-value-" + keys[i]).text(result_obj[keys[i]])
                        }

                    },

                    delay: function() {
                        return 2000;
                    },

                    fail: function() {
                        console.log("2fail");
                    }
                },

            },

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

            calcAllSheet: function () {
                result_obj["a"] = result_obj["x"] * result_obj["y"];
            }
        }

        return utils;
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
                let result = validate(value, key);
                return_obj[key] = result;
            });
            
            if (error == null) {
                displayNoError();
                form_data = _.clone(return_obj);
                return return_obj;
            }

            displayError();
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
        validate = function (value, key) {
            //半角数字判定
            try {
                if (checkType(/^([1-9]\d*|0*).??([1-9]\d*|0*)$/, value)) {
                    return parseFloat(value, 10);
                } 

                //全角数字判定
                if (checkType(/^([０-９]*)$/, value)) {
                    value = toHalfWidth(value);
                    return parseInt(value, 10);
                }
                setError(errors["ERROR1"], key);
            } catch(e) {
                setError(errors["ERROR1"], key);
            }

        }

        //==================================================================
        let return_obj = {};
        return_obj[command_name] = excute;
        return return_obj;
    }

    view = function () {

        let config,
            handlers,
            animation,
            targetDom,
            initAdviceDom;

        //==================================================================

        //==================================================================

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

        //==================================================================
        //==================================================================
        
        //ボタンの共通ユーティリティ    
        config = {
            toggleFlag: function (target) {
                return !target.active_flag;
            },

            setEventHandler: function (target, btn_obj, func) {
                let that = this;
                return function () {
                    target.dom.on(btn_obj.event, function() {

                        func(target, btn_obj);
                        target.active_flag = that.toggleFlag(target);
                    })
                }
            },
        }

        animation = {
          
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
        }

        initAdviceDom = function () {
            _.map(targetDom, function(dom){
                dom.html("");
            })
        }

        //==================================================================
        //==================================================================
        //==================================================================
        
        //クリックイベントのハンドラー
        handlers = {
            backToPage: function (target) {
                window.history.back();
            },
    
            calcNumbersOfSheets: function (target, btn_obj) {

                if (calc_process_flag == true) {
                    return;
                }
                calc_process_flag = true;
                //連打対策
                // if (start_flag == true) {
                //     console.log(async_process_flag)
                //     return;
                // }
     
                target.dom.addClass("isActive").on('transitionend webkitTransitionEnd',function(){
                    setTimeout(function(){
                        target.dom.removeClass("isActive");
                    }, 500);
                })

                pipelineWithResrouce(btn_obj.resource, btn_obj.methods)();
            },

            closeModal: function (target, btn_obj) {
                pipeline.apply(null, btn_obj.methods)();
                initAdviceDom();
            }

        }

        //==================================================================
        return {
            config: config,
            handlers: handlers,
            animation: animation,
            targetDom: targetDom,
        }
    }

//==================================================================
//==================================================================
    //executeモジュールのオブジェクト取得
    view_obj = view();
    formComp_obj = formComp();
    sheets_utils_obj = sheets_utils();
    asyncProccess_obj = asyncProccess();

    modalContent = view_obj.targetDom;
//==================================================================
//==================================================================
//==================================================================
//==================================================================
//==================================================================
    //以下、メインロジック起動

    featureSet = function (number_of_sheets) {

        let top_text = "10mm厚4.5畳用";
        let bottom_text = "18mm厚4.5畳用";
        let items = {
            set12: {
                thumb: "img/thumb12.png",
                top: {
                    text: `${top_text}<br>12枚セット`,
                    cost: "2,990",
                    href: "/12_top",
                },
                bottom: {
                    text: `${bottom_text}<br>12枚セット`,
                    cost: "3,990",
                    href: "/12_bottom",
                },
            },
            set25: {
                thumb: "img/thumb25.png",
                top: {
                    text: `${top_text}<br>25枚セット`,
                    cost: "2,990",
                    href: "/25_top",
                },
                bottom: {
                    text: `${bottom_text}<br>25枚セット`,
                    cost: "3,990",
                    href: "/25_bottom",
                },
            },

            set36: {
                thumb: "img/thumb36.png",
                top: {
                    text: `${top_text}<br>36枚セット`,
                    cost: "2,990",
                    href: "/36_top",
                },
                thumb: "img/thumb12.png",
                bottom: {
                    text: `${bottom_text}<br>36枚セット`,
                    cost: "3,990",
                    href: "/36_bottom",
                },
            },

            set48: {
                thumb: "img/thumb48.png",
                top: {
                    text: `${top_text}<br>48枚セット`,
                    cost: "2,990",
                    href: "/48_top",
                },
                bottom: {
                    text: `${bottom_text}<br>48枚セット`,
                    cost: "3,990",
                    href: "/48_bottom",
                },
            },

            set64: {
                thumb: "img/thumb64.png",
                top: {
                    text: `${top_text}<br>64枚セット`,
                    cost: "2,990",
                    href: "/64_top",
                },
                bottom: {
                    text: `${bottom_text}<br>64枚セット`,
                    cost: "3,990",
                    href: "/64_bottom",
                },
            },
        };

        return (function () {

            if (number_of_sheets <= 12) {
                return items.set12;

            } else if (number_of_sheets <= 25) {
                return items.set25;

            } else if (number_of_sheets <= 36) {
                return items.set36;
            
            } else if (number_of_sheets <= 48) {
                return items.set48;
            }

            return items.set64;
            
        }());
        
    }

    error_key = "#js-Error"
    errors = {
        ERROR1: "⚠数字を入力してください。",
        ERROR2: "25mm以上長さが必要です。",
        ERROR3: "整数で記入してください。",
    }
    
    let formValue = function () {
        let height = $("#height").val();
        let width = $("#width").val();

        return {
            height: height,
            width: width,
        }
    }

    error_for_pc = {
        height: {
            key: "#js-Error-forHeight",
            message: "",
        },
        width: {
            key: "#js-Error-forWidth",
            message: "",
        }
    };


    let processResultDisplay = function (target_dom) {

        return function () {
                console.log("process: reuslt display");

                let result_page,
                    number_of_sheets,
                    area,
                    feature;

                result_page = function () {
                    let b = remainder_result["b"];
                    let c = remainder_result["c"];

                    if (b === true && c === true) {
                        return {
                            img: "img/panel_img-01.jpg",
                            title: "設置するときは...",
                            top: "適宜サイドパーツをカットして<br>調節できます。",
                        };
                    } else if (b === false && c === false) {
                        return {
                            img: "img/panel_img-02.jpg",
                            title: "カットするときは...",
                            top: `タテの最後のマス：<span>${result_obj["b"]}mm</span>`,
                            bottom: `ヨコの最後のマス：<span>${result_obj["c"]}mm</span>`,
                        };
                    } else {
                        return {
                            img: "img/panel_img-02.jpg",
                            title: "カットするときは...",
                            top: `タテの最後のマス：<span>${result_obj["b"]}mm</span>`,
                            bottom: "ヨコの辺は<br>サイドパーツをカットして調節できます。",
                        };
                    }
                }();

                (function(){

                    target_dom.pannel.attr("src", result_page["img"])
                    //枚数表示
                    number_of_sheets = result_obj["a"];
                    target_dom.number_of_sheets.html(`${number_of_sheets}<span>枚</span>`);

                    //面積表示
                    area = (form_data["height"] * form_data["width"]) / 1000000;
                    target_dom.area.html(`${area}m&#xB2;`);
                }());

                //おすすめのセット
                //おすすめ商品リンク　周囲のサムネイル、文字もリンクにする
                (function() {
                    feature = featureSet(number_of_sheets);
                    let top = feature.top;
                    let bottom = feature.bottom;

                    target_dom.link_top.html(
                        `${top.text}<span>￥${top.cost}税込</span>`
                    )
                    target_dom.link_top.attr("href", top.text.href);
                    
                    target_dom.link_bottom.html(
                        `${bottom.text}<span>￥${bottom.cost}税込</span>`
                    )
                    target_dom.link_bottom.attr("href", feature.bottom.text.href);

          
                    target_dom.thumb.attr("src", feature.thumb)

                }());

                
                //最後のマス
                (function(){
                    target_dom.advice_title_dom.html(result_page["title"]);
                    target_dom.advice_top.html(result_page["top"]);
                    target_dom.advice_bottom.html(result_page["bottom"]);
                }())


                setTimeout(function(){
                    calc_process_flag = false;
                }, 1000)
            };
    }

    let checkParseResult = function (data) {
        let denominator = DENOMINATOR();
        _.map(data, function(value, key){

            if (!Number.isInteger(value)) {
                setError(errors["ERROR3"], key);
                return false;
            }
            if (value < denominator) {
                setError(errors["ERROR2"], key);
                return false;
            }
        });
        if (error != null) {
            displayError();
            
            return false;
        }
        
        return data;
    }

    //各種ボタンのイベント設定
    let resource = function(data) {
        return {
            height: data.height,
            width: data.width,
        }
    }

    let modal = view_obj.animation.toggleModal();

    let modalWrapper = function (data) {
        if (open_modal_flag == true) {
            return data;
        }
        return modal(data);
    }
    
    let innerProcess = function (func1) {
        let inner_funcs = [
            processResultDisplay(modalContent),
        ];

        asyncProccess_obj.start(view_obj.animation.loading(), func1, inner_funcs)
    }

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

    _.map(event_btns, function (btn) {
        setBtnEvent(btn);
    });

})();