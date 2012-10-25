var util = require('util'),
    fs = require('fs'),
    xml2js = require('xml2js-expat'),
    kmeans = require('./kmeans');

var parser = new xml2js.Parser(function(result, error) {
  var data = []
  var X = []
  var data_type = result.data.record[0].field[1]['#']
  for (var i = 0,l = result.data.record.length;i < l;++i) {
    var r = result.data.record[i].field
    var d = {}
    var name = r[0]['#'],key = r[0]['@']['key'],year = parseFloat(r[2]['#'],10),value = parseFloat(r[3]['#'],10)
    var _d = data.filter(function(o) {return o.key == key})[0]
    if (_d) {
      _d.data.push({year:year,value:value})
      X[data.indexOf(_d)].push(value)
    }
    else {
      data.push({
        name: name,
        key: key,
        data: [{
          year: year,
          value: value
        }]
      })
      X.push([value])
    }
  }
  for (var i = 0;i<X.length;++i) {
    X[i] = X[i].filter(function(e) {return e})
    if (X[i].length != 0) {
      X[i] = X[i].reduce(function(e,sum) {return sum += e},0)/X[i].length
    } else {
      X.splice(X.indexOf(X[i]),1)
      data.splice(i,1)
      --i
    }
  }

  var idx = new kmeans(X,10,1000)
  var _idx = []
  for (var j = 0,k = idx.elements.length;j<k;++j) {
    var m = idx.elements[j] - 1
    if (_idx[m] instanceof Array)
      _idx[m].push(data[j].name)
    else
      _idx[m] = [data[j].name]
  }
  console.log("-----------------------------"+data_type+"---------------------------------");
  console.log(_idx);
});

// EG.EGY.PROD.KT.OE_Indicator_en.xml     &&     EG.USE.COMM.KT.OE_Indicator_en.xml   &&   IP.JRN.ARTC.SC_Indicator_en.xml  
// && SH.XPD.PCAP_Indicator_en.xml   && NV.AGR.TOTL.ZS_Indicator_en.xml && IC.REG.DURS_Indicator_en.xml && EG.USE.COMM.CL.ZS_Indicator_en.xml
fs.readFile(__dirname + '/NV.AGR.TOTL.ZS_Indicator_en.xml', function(err, data) {
    parser.parseString(data)
});