function ajax(options) {
    let config = {
        url: '',
        type: 'get',
        data: '',
        dataType: 'text',
        async: true,
        success: null,
        error: null,
        beforeSend: null
    }
    

    config = Object.assign(config, options);

    var xhr = null;


    function getxhr() {
        xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        return xhr;
    }

    xhr = getxhr();

    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if ((this.status >= 200 && this.status < 300) || this.status == 304) {
                // 判断服务器数据返回类型dataType
                switch (config.dataType) {
                    case "text":
                        config.success && config.success(this.responseText);
                        break;
                    case "json":
                        config.success && config.success(JSON.parse(this.responseText));
                        break;
                }
            } else {
                 config.error && config.error(this);
            }
        } else {
            config.beforeSend && config.beforeSend(this);
        }
        
    }
    // + '&_=' + (new Date).getTime()
    xhr.open(config.type, config.url, config.async);

    if (config.type === 'post') {
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }


    function setQueryString(obj) {
        var params = [];
        Object.keys(obj).forEach((v) => {
            params.push(`${v}=${obj[v]}`)
        })
        return params.join('&');
    }

    if (typeof config.data === 'object') {
        config.data = setQueryString(config.data);
    }
    xhr.send(config.type == 'get' ? null : config.data)
}