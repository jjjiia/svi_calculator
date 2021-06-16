//check calculations - remove duplicates of values and calculate percentile
//reset income initial value
//add map of above and below
//add count to map
//

var pub={
    svi:null,
    lastCounty:null,
    temp:null
}
function PlusCaps(measureName) {
	if(measureName=="PCI"){
    	var nextValue = parseInt(document.getElementById("count_"+measureName).value.replace("$","")) + 1000;
	}else{
    	var nextValue = parseInt(document.getElementById("count_"+measureName).value.replace("%","")) + 1;
	}
    setNextValue(nextValue,"count_"+measureName);
}

function MinusCaps(measureName) {
    if(parseInt(document.getElementById("count_"+measureName).value.replace("$","").replace("%",""))>=1){
		if(measureName=="PCI"){
	    	var nextValue = parseInt(document.getElementById("count_"+measureName).value.replace("$","")) - 1000;
		}else{
	    	var nextValue = parseInt(document.getElementById("count_"+measureName).value.replace("%","")) - 1;
		}
		
          setNextValue(nextValue,"count_"+measureName);
    }
	
}
var colors = ["F4AE00","#FB7139","#E4002B","#DB3EB1"]

function setNextValue(nextValue,divName) {
  //localStorage.setItem("CapsNum", nextValue);
  console.log(divName)
  if(divName=="count_PCI"){
	  document.getElementById(divName).value = "$"+nextValue;
  	
  }else{
	  document.getElementById(divName).value = nextValue+"%";
  }
  recalculateAll()
}

function recalculateAll(){
    var currentCounty = {}
    for(var m in measures){
        var key = "EP_"+measures[m]
        var value=parseInt(document.getElementById("count_"+measures[m]).value)
        currentCounty[key]=value
    }
   // var newCounties = pub.svi.push(currentCounty)
    // console.log(newCounties)
    getPercentiles(currentCounty,pub.svi)
   // console.log(currentCounty)
    //d3.select("#sum").html(sum)
    
}

var allData = d3.csv("SVI2018_US_COUNTY.csv")
var allData = d3.csv("SVINewYork2018_CensusTract.csv")
// var tempData = d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv")
Promise.all([allData])
.then(function(data){
    ready(data[0])
})
function ready(svi){
    // pub.temp =temp
   // pub.svi = svi
	var nyc = []
	var nycCounties = ["Queens","Bronx","New York","Richmond","Kings"]
	
	for(var i in svi){
		if(nycCounties.indexOf(svi[i].COUNTY)!=-1){
			nyc.push(svi[i])
		}
	}
    pub.svi = nyc
//	console.log(nyc)
	
    //get random county
    var randomCounty = {}
    
    for(var m in measures){
      //  var average = getAverages(measures[m],pub.svi)
       // console.log(average)
        var sorted = svi.sort(function(a,b){
            return parseFloat(a["EP_"+measures[m]])-parseFloat(b["EP_"+measures[m]])
        })
      
        var lower = svi.length/2
        var higher = svi.length/2+1
        var measure = "EP_"+measures[m]
        var median = (parseFloat(sorted[lower][measure])+parseFloat(sorted[higher][measure]))/2
        
        randomCounty["EP_"+measures[m]]=median
        
        d3.select("#count_"+measures[m])
		.attr("value",function(){
			if(measure[m]=="PCI"){
				return "$"+0
			}
			return 0+"%"
		})
    }        
    
    getPercentiles(randomCounty,pub.svi)

    //outline calculations
}

function getPercentiles(data,svi){
  //  console.log(svi)
    var notEqual = []
    var percentileTotal = 0
    var precalcTotal = 0
    var addingText = ""
    //svi.push(data)
    
    for(var m in measures){
        	var measure = "EP_"+measures[m]
			var ordered = svi.sort(function(a,b){
	                return a["EP_"+measures[m]]-b["EP_"+measures[m]]
            })
			//console.log(ordered)
            
            for(var s in ordered){                
                if(parseFloat(data[measure])<parseFloat(ordered[s][measure])){
                   var index = s
                    break
                }
            }
            
            var percentile = Math.round(index/svi.length*1000)/1000
            
            var precalcPercentile = data["EPL_"+measures[m]]
        
            percentileTotal+=percentile
            precalcTotal+=parseFloat(precalcPercentile)
    
            if(m==measures.length-1){
                addingText+=percentile+" = "
                
            }else{
                addingText+=percentile+"<br> + "
            }
        
            d3.select("#rankNumbers_"+measures[m])
            .html(function(){
				if(index[index.length-1]==1){
					return "<span class=\"rankNumber\">"+index+"<sup>st</sup></span><br>"
				}else if(index[index.length-1]==2){
					return "<span class=\"rankNumber\">"+index+"<sup>nd</sup></span><br>"
				}else if(index[index.length-1]==3){
					return "<span class=\"rankNumber\">"+index+"<sup>rd</sup></span><br>"
				}
                    return "<span class=\"rankNumber\">"+index+"<sup>th</sup></span><br>"//"<br> out of "+svi.length+""                
            })
            .style("color","black")   
            
            d3.select("#percentileNumbers_"+measures[m])
            .html(function(){
                    return "<span class=\"percentileNumber\">"+percentile+"</span>"
            })
            
            var h = 50
            var w = 200
            var p = 20         
    }
    
    var themesSort = svi.sort(function(a,b){
        return a["RPL_THEMES"]-b["RPL_THEMES"]
    })
    for(var i in themesSort){
               //
       // // if(themesSort[i]["RPL_THEMES"]!="-999.0"){
       //     console.log(parseFloat(themesSort[i]["SPL_THEMES"]))
       //     console.log(percentileTotal)
           if(percentileTotal<parseFloat(themesSort[i]["SPL_THEMES"])){
               //console.log([themesSort[i]["SPL_THEMES"],percentileTotal,i])
               //console.log(themesSort[i]["RPL_THEMES"])
               var totalPercentile = i/svi.length
               
               break
            }
      //  }
      
    }
  //  console.log(data["RPL_THEMES"])
    var neighbors = [svi[svi.indexOf(data)-1],svi[svi.indexOf(data)+1]]
    
    
    d3.select("#adding").html(addingText)
    d3.select("#percentileTally").html("<span style=\"color:#DB3EB1; font-size:12px; font-weight:bold;\">"
					+"The Sum of Percentiles</span>  and <span style=\"color:#DB3EB1; font-size:12px; font-weight:bold;\">SVI</span> is  <br><br><span class=\"finalNumber\">"
                    +Math.round(percentileTotal*10000)/10000
                    +"</span><br>out of 15."//+" This total is higher than "
                   // +i+" other counties in this country. The SVI ranking is the percentile rank of "
                   // +"<span class=\"totalpercentileNumber\">"+Math.round(totalPercentile*10000)/100+"%</span>"
                  )

}
