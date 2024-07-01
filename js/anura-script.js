(function(){
  var anuraScriptOptions = JSON.parse(anuraOptions).script;
  
  var request = {
   instance: anuraScriptOptions.instanceId,
   callback: "anuraWPCallback"
  };

  if (anuraScriptOptions.source) {
   request.source = anuraScriptOptions.source;
  }

  if (anuraScriptOptions.campaign) {
   request.campaign = anuraScriptOptions.campaign;
  }
  
  if (containsAdditionalData(anuraScriptOptions.additionalData)){
   request.additional = toAdditionalDataString(anuraScriptOptions.additionalData);
  }  

  var anura = document.createElement('script');
  if ('object' === typeof anura) {
      var params = [];
      for (var x in request) params.push(x+'='+encodeURIComponent(request[x]));
      params.push(Math.floor(1E12*Math.random()+1));
      anura.type = 'text/javascript';
      anura.async = true;
      anura.src = 'https://script.anura.io/request.js?'+params.join('&');
      var script = document.getElementsByTagName('script')[0];
      script.parentNode.insertBefore(anura, script);
  }
})();

function toAdditionalDataString(additionalData) {
   var additionalDataObj = {};
   for (let i = 0; i < additionalData.length; i++) {
      additionalDataObj[i+1] = additionalData[i];
   }

   return JSON.stringify(additionalDataObj);
}

function containsAdditionalData(additionalData) {
   for (let i = 0; i < additionalData.length; i++) {
      if (additionalData[i]) {
         return true;
      }
   }

   return false;
}

if (!window.JSON) {
  window.JSON = {
     parse: function(sJSON) {
        return eval("(" + sJSON + ")");
     },
     stringify: (function() {
        var toString = Object.prototype.toString;
        var isArray = Array.isArray || function(a) {
           return toString.call(a) === "[object Array]";
        };
        var escMap = {
           "\b": "\\b",
           "\f": "\\f",
           "\n": "\\n",
           "\r": "\\r",
           "\t": "\\t"
        };
        var escFunc = function(m) {
           return escMap[m];
        };
        var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
        return function stringify(value) {
           if (value === null) {
              return "null";
           } else if (typeof value === "number") {
              return isFinite(value) ? value.toString() : "null";
           } else if (typeof value === "boolean") {
              return value.toString();
           } else if (typeof value === "object") {
              if (typeof value.toJSON === "function") {
                 return stringify(value.toJSON());
              } else if (isArray(value)) {
                 var res = "[";
                 for (var i = 0; i < value.length; i++) res += (i ? ", " : "") + stringify(value[i]);
                 return res + "]";
              } else if (toString.call(value) === "[object Object]") {
                 var tmp = [];
                 for (var k in value) {
                    if (value.hasOwnProperty(k)) tmp.push(stringify(k) + ": " + stringify(value[k]));
                 }
                 return "{" + tmp.join(", ") + "}";
              }
           }
           return "\"" + value.toString().replace(escRE, escFunc) + "\"";
        };
     })()
  };
}
