// HMIS dashboard

var volume_url = '/api/volume/'
var outcomes_url = '/api/outcomes'
var demo_url = '/api/demo/'

fetch(volume_url+"All").then( response => {
    return response.json();
}).then(data => {
    // console.log('Full Data: ', data);
    programs  = ['Permanent Housing', 'Emergency Shelter','Rapid Re-Housing','Street Outreach','Transitional Housing','Other']
    programs.forEach(item => {
        d3.select('#selDatasetVolume').append("option").text(item).attr("value", item);
        d3.select('#selDatasetDemo').append("option").text(item).attr("value", item);
    });
    var years = [2015,2016,2017,2018,2019]
    years.forEach(item => {
        d3.select('#selDataset').append("option").text(item).attr("value", String(item))
    });
    var volume_data = unpackVolume(data);
    buildYearlyBar(volume_data);
    buildYearlyDistinctBar(volume_data);
});

function unpackVolume(data){
    var volume_data = {};
    volume_data['years'] = Object.entries(data.in).map(d => d[0]);
    volume_data['in'] = Object.entries(data.in).map(d => d[1]);
    volume_data['out'] = Object.entries(data.out).map(d => d[1]);
    volume_data['active'] = Object.entries(data.active).map(d => d[1]);
    volume_data['distinct_active'] = Object.entries(data.active_dist).map(d => d[1]);
    volume_data['distinct_in'] = Object.entries(data.in_dist).map(d => d[1]);
    volume_data['distinct_out'] = Object.entries(data.out_dist).map(d => d[1]);
    return volume_data
}

fetch(outcomes_url).then(response => {
    return response.json();
}).then( data => {
    // console.log('Full Data: ', data);
    // console.log(data);
    dataFormat = unpackOutcomes(data);
    buildOutcomes(dataFormat);
});
fetch(demo_url+"2018/"+"All").then(response => {
    return response.json();
}).then( data => {
    // console.log('Full Data: ', data);
    // console.log(data);
    updateDemo(data, '2018','All');
});

function unpackOutcomes(response) {
    return_data = {'yearly':{'average':{},
                        'percent_ph':{}
                        },
                        'monthly':{'exit_ph':{},
                                    'exit_all':{},
                                    'percent_ph':{},
                                    }};
    var monthly = response[0];
    for (var i = 0; i < monthly.length; i++) {
        return_data.monthly.exit_ph[monthly[i][1]] = monthly[i][2]
        return_data.monthly.exit_all[monthly[i][1]] = monthly[i][0]
        return_data.monthly.percent_ph[monthly[i][1]] = monthly[i][3]
    };
    var yearly = response[1];
    for (var i = 0; i < yearly.length; i++) {
        return_data.yearly.average[yearly[i][2]] = yearly[i][0]
        return_data.yearly.percent_ph[yearly[i][2]] = yearly[i][1]
    };
    // response[0].forEach(item => {
        
    //     return_data.monthly.exit_ph[item[1]] = item[2]
    //     return_data.monthly.exit_all[item[1]] = item[0]
    //     return_data.monthly.percent_ph[item[1]] = item[3]
    // });
    // response[1].forEach(item => {
    //     return_data.yearly.average[item[2]] = item[0]
    //     return_data.yearly.percent_ph[item[2]] = item[1]
    // });
    console.log(return_data);
    return return_data
}




function buildOutcomes(outcomesData) {
    var monthlyOutcomesgraph = {};
    var years_list = ['2015','2016','2017','2018','2019'];
    years_list.forEach(function(year) {
        function monthlyDictFilter(d) {
            return (String(d[0]).split('-')[0] === year)
        }
        monthlyOutcomesgraph[year] = {
            'percentPHmo': Object.entries(outcomesData.monthly.percent_ph).filter(monthlyDictFilter).map(d => d[1]),
            'exitAll': Object.entries(outcomesData.monthly.exit_all).filter(monthlyDictFilter).map(d => d[1]),
            'exitPH': Object.entries(outcomesData.monthly.exit_ph).filter(monthlyDictFilter).map(d => d[1])
        }
    });
    buildTable(outcomesData);

    // PH chart
    d3.select('container').html
    phChart = Highcharts.chart('container', {
        // chart: {
        //     type: 'bar'
        // },
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: [
                        'printChart',
                        // 'separator',
                        'downloadPNG',
                        'downloadJPEG',
                        'downloadPDF',
                        'downloadSVG',
                        'downloadCSV',
                        'downloadXLS'
                    ]
                }
            }
        },

        title: {
            text: 'Program enrollees with permanent housing upon program exit'
        },
        subtitle: {
            text: 'For all participants who leave a program,\
             the percent who exited to permanent housing is shown. Participants are counted once.'
        },
        // Turn off Highcharts.com label/link 
        credits: {
            enabled: true
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        },
        yAxis: {
            min: 0,
            title: {
                text: ''
            },
            labels: {
                format: '{value}%',
            }
        },
        series: [{
            name: '2015',
            // data: [
            //     // if want to add N per period as well format as:
            //     // {y: series data,
            //     // myData: outside data}
            // ]
        }, 
        {
            name: '2016',
            // data: []
        },
        {
            name: '2017',
            // data: []
        },    {
            name: '2018',
            // data: []
        },    {
            name: '2019',
            // data: []
        },
        ],
        // Moves location of series names to be as close as possible to line
        legend: {
            layout: 'proximate',
            align: 'right'
        },
        tooltip: {
            // shared: true, //makes all data for that time point visible
            useHTML: true, //allows for more custom and complicated tooltip design
            // headerFormat: '{point.key}<table>',
            // pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
            //     '<td style="text-align: right"><b>{point.y} EUR</b></td></tr>',
            // footerFormat: '</table>',
            // valueDecimals: 2
            formatter: function () {
                return this.x + " " +this.series.name + ": <b>" + this.y
                +"%</b><br> " + this.point.myData2 + " out of " + this.point.myData 
            + "<br>Exited to permanent housing";
            }
            },
            });
        let years = []
        let keys = Object.keys(monthlyOutcomesgraph);
        years.push(keys)
            
        let phSeries = []
            years[0].forEach(year =>{ 
            var toPush = []
            monthlyOutcomesgraph[year].percentPHmo.forEach((item, index) => {
               toPush.push({'y':item, 'myData':monthlyOutcomesgraph[year].exitAll[index],
                'myData2':monthlyOutcomesgraph[year].exitPH[index]})
            });
            phSeries.push(toPush);
            });
        // Limit predicted monthly values 
        phSeries[4].length = 8;

    phChart.series.forEach(year => { 
        let index = year.index

        year.update({
        data: phSeries[index]
        }, true)
        })

}

//function to build new table 
function buildTable(outcomesData) {
    var loop_data = outcomesData.yearly.average;
    Object.keys(loop_data).forEach((item, index) => {
        d3.select('#append-me').append('tr').html(`
        <th scope="row">${item}</th>
      <td>${loop_data[item]}</td>
      <td>${outcomesData.yearly.percent_ph[item]}</td>
        `);
    }) 
}


// Function to build yearly flow bar chart

function buildYearlyBar(yearlyData) {
    var years = yearlyData.years;
    // var data = [yearlyData.in, yearlyData.active, yearlyData.out]

    var chartOptions =  {
        chart: {
            type: 'column'
        },
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: [
                        'printChart',
                        // 'separator',
                        'downloadPNG',
                        'downloadJPEG',
                        'downloadPDF',
                        'downloadSVG',
                        'downloadCSV',
                        'downloadXLS'
                    ]
                }
            }
        },

        title: {
            text: 'Program Participation by Year'
        },
        subtitle: {
            text: 'This chart shows the total homeless services program enrollments each year, and of those, the number of new enrollments during the year and the number of enrollments that ended that year. Clients are included more than once if participating in more than one program.'
        },
        colors: ["#434348", "#7cb5ec", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"],

        xAxis: {
            categories: [
                
            ],
            crosshair: true
        },
        yAxis: {
            min: 0,
            max: 21000,
            endOnTick: false,
            title: {
                text: '',
                // rotation: 0,
                // y: 0
            }
        },
        credits: {
            enabled: true
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:"black";padding:0">{series.name}: </td>' +
                '<td style="padding:0; text-align:right"><b>{point.y}</b></td></tr>',

            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Total enrollments',
            data: []
        }, {
            name: 'New enrollments',
            data: []
        }, {
            name: 'Enrollments ended',
            data: []
        }],
        annotations: [{
            labels: [{
                point: {
                    x: 4,
                    y: 18800,
                    xAxis: 0,
                    yAxis: 0,

            },
            style: {
                fontSize: '9px'            
            },
                text: 'Data through <br> August 2019'
            }],
            labelOptions: {
                backgroundColor: 'rgba(255,255,255, 0.3)',
                borderWidth: 0,
            }}]
        };

    years.forEach((year,index) => {
        chartOptions.series[1].data.push(yearlyData.in[index]);
        chartOptions.series[0].data.push(yearlyData.active[index]);
        chartOptions.series[2].data.push(yearlyData.out[index]);
        chartOptions.xAxis.categories.push(year);
    });

    Highcharts.chart('yearly-bar',chartOptions);
    
  }
//   Build distinct count of clients bar chart
  function buildYearlyDistinctBar(yearlyData) {
    var years = yearlyData.years;
    var data = [yearlyData.distinct_in, yearlyData.distinct_active, yearlyData.distinct_out]

    var chartOptions =  {
        chart: {
            type: 'column'
        },
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: [
                        'printChart',
                        // 'separator',
                        'downloadPNG',
                        'downloadJPEG',
                        'downloadPDF',
                        'downloadSVG',
                        'downloadCSV',
                        'downloadXLS'
                    ]
                }
            }
        },

        title: {
            text: 'Distinct Count of Clients'
        },
        subtitle: {
            text: 'This chart shows the total number of people who received homeless services by year, and of those, the number who started receiving services that year and the number who ended services that year. Each client is counted only once.'
        },
        // annotations: [{
        //     labels: [{
        //         point: {
        //             // xAxis: 0,
        //             // yAxis: 0,
        //             // x:300,
        //             // y:50,

        //         },
        //         text: 'Projected'
            // }],
        //     labelOptions: {
        //         x: 10, y: -10
        //     }
        // }],
        xAxis: {
            categories: [
                
            ],
            crosshair: true
        },
        yAxis: {
            min: 0,
            max: 21000,
            endOnTick: false,
            title: {
                text: '',
                // rotation: 0,
                // y: 0
            }
        },
        credits: {
            enabled: true
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:"black";padding:0">{series.name}: </td>' +
                '<td style="padding:0; text-align:right"><b>{point.y}</b></td></tr>',

            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Total clients',
            data: []
    
        }, {
            name: 'New clients',
            data: []
    
        }, {
            name: 'Clients who ended services',
            data: []
    
        }],
        colors: ["#434348","#7cb5ec",  "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"],
        annotations: [{
            labels: [{
                point: {
                    x: 4,
                    y: 11550,
                    xAxis: 0,
                    yAxis: 0,
            
            },
            style: {
                // color: 'rgba(210, 215, 211, 1)',
                fontSize: '9px'
            },
                text: 'Data through <br> August 2019'
            }],
            labelOptions: {
                backgroundColor: 'rgba(255,255,255, 0.3)',
                borderWidth: 0,
            }}]
    };
    years.forEach((year,index) => {
        chartOptions.series[1].data.push(yearlyData.distinct_in[index]);
        chartOptions.series[0].data.push(yearlyData.distinct_active[index]);
        chartOptions.series[2].data.push(yearlyData.distinct_out[index]);
        chartOptions.xAxis.categories.push(year);
    });

    Highcharts.chart('yearly-bar-distinct',chartOptions);
    
  }
function updateDemo(demo,year, prog) {
//Race tree map
    var racechartOptions = {
        // colorAxis: {
        //     minColor: '#ffffff',
        //     maxColor: '#f28f43'
        // },
        tooltip: { 
            enabled: false 
        },
        chart: {
            type: 'bar'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                },
                showInLegend: false
            }
        },
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: [
                        'printChart',
                        // 'separator',
                        'downloadPNG',
                        'downloadJPEG',
                        'downloadPDF',
                        'downloadSVG',
                        'downloadCSV',
                        'downloadXLS'
                    ]
                }
            }
        },
        subtitle: {
            text: `Program Type: ${prog}`
        },
        xAxis: {
            categories: [
        ],
            crosshair: true
        },
        credits: {
            enabled: true
        },
        yAxis: {
            min: 0,
            title: {
                text: ''
            }
        },
        // credits: {
        //     enabled: false
        // },
        series: [{
            // type: 'treemap',
            // layoutAlgorithm: 'sliceAndDice',
            data: []
        }],
        title: {
            text: `${year} Race`
        }
    };

    var race = Object.entries(demo.race).sort((a,b) => a[1] - b[1]);
    
    race.reverse().forEach(item => {
        racechartOptions.series[0].data.push(item[1]);
        racechartOptions.xAxis.categories.push(item[0])
        //     {name: item[0],
        //     value: item[1],
        //     colorValue: item[1]}
        // )
    });

    Highcharts.chart('race', racechartOptions);
    
// Gender hbar chart
    
    var chartOptions =  {
        tooltip: { 
            enabled: false 
        },
        chart: {
            type: 'bar'
        },
        title: {
            text: `${year} Gender`
        },
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: [
                        'printChart',
                        // 'separator',
                        'downloadPNG',
                        'downloadJPEG',
                        'downloadPDF',
                        'downloadSVG',
                        'downloadCSV',
                        'downloadXLS'
                    ]
                }
            }
        },

        subtitle: {
            text: `Program Type: ${prog}`
        },
        xAxis: {
            categories: [
        ],
            crosshair: true,
        },
        credits: {
            enabled: true
        },
        yAxis: {
            min: 0,
            title: {
                text: ''
            }
        },
        // tooltip: {
        //     headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        //     pointFormat: '<tr><td style="color:"black";padding:0">{series.name}: </td>' + " " +
        //         '<td style="padding:0; text-align: right"><b>{point.y}</b></td></tr>',
        //     footerFormat: '</table>',
        //     shared: true,
        //     useHTML: true
        // },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                },
                showInLegend: false
            }
        },
        series: [{
            name: 'Number of Program Enrollees',
            data: [],
            color: "#f7a35c"
    
        }]
    };
    var gender = Object.entries(demo.sex).sort((a,b) => a[1] - b[1]);
    gender.reverse().forEach(item => {
        chartOptions.series[0].data.push(item[1]);
        chartOptions.xAxis.categories.push(item[0])
        //     {name: item[0],
        //     value: item[1],
        //     colorValue: item[1]}
        // )
    });

    Highcharts.chart('gender',chartOptions);

// Age box plot 


ageOptions =  {
    chart: {
      type: 'column'
    },
    title: {
      text: `${year} Age`
    },
    subtitle: {
      text: `Program Type: ${prog}`
    },
    xAxis: {
      categories: [
      ],
      crosshair: true
    },
    yAxis: {
      min: 0,
      title: {
        text: ''
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px;color:{series.color};padding:0">Age: {point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">Number of Clients: </td>' +
        '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
        groupPadding: 0,
        shadow: false
      }
    },
    series: [{
      name: 'Data',
      data: []
  
    }]
  };

  var age = Object.entries(demo.age).sort((a,b) => a[0] - b[0]);
  age.forEach(item => {
      ageOptions.series[0].data.push(item[1]);
      ageOptions.xAxis.categories.push(item[0]);
    
  });

  Highcharts.chart('age',ageOptions);
    // var age = demo.age[0][0];
    // //have to convert data type 
    // age.forEach((item,index) => {
    //     age[index] = parseFloat(item);
    // })
    // var ageOptions = {

    //     chart: {
    //         type: 'boxplot'
    //     },
    //     credits: {
    //         enabled: true
    //     },
    
    //     title: {
    //         text: `${year} Age`
    //     },
    //     exporting: {
    //         buttons: {
    //             contextButton: {
    //                 menuItems: [
    //                     'printChart',
    //                     // 'separator',
    //                     'downloadPNG',
    //                     'downloadJPEG',
    //                     'downloadPDF',
    //                     'downloadSVG',
    //                     'downloadCSV',
    //                     'downloadXLS'
    //                 ]
    //             }
    //         }
    //     },

    //     legend: {
    //         enabled: false
    //     },
    
    //     xAxis: {
    //         categories: [`${year}`],
    //         title: {
    //             text: ''
    //         }
    //     },
    
    //     yAxis: {
    //         title: {
    //             text: 'Age  ',
    //             rotation: 0,
    //             // offset: 0,
    //             // x: -50,
    //             y: -15,
    //             labels: {
    //                 align: 'left',
    //             }
    //         },
    //         max:100,
    //         min: 0,

    //     },
    //     plotOptions: {
    //         boxplot: {
    //             fillColor: '#91e8e1',
    //             lineWidth: 1,
    //             lineColor: '#2b908f',
    //             medianColor: '#2b908f',
    //             medianWidth: 3,
    //             stemColor: '#2b908f',
    //             stemDashStyle: 'dash',
    //             stemWidth: 1,
    //             whiskerColor: '#2b908f',
    //             whiskerLength: '20%',
    //             whiskerWidth: 3
    //         }
    //     },
    //     series: [{
    //         name: 'Age',
    //         data: [
    //             age
    //         ],
    //         tooltip: {
    //             headerFormat: ''
    //         }
    //     }]
    
    // };

    // Highcharts.chart('age',ageOptions);
    // code for cards
}
// function attached to event listener in html for when the option 
// in drop down box changes for year selection in demo row 
function optionChanged(value) {
    var selected = document.getElementById('selDatasetDemo');
    var demo = selected.options[selected.selectedIndex].value;
    d3.json(demo_url+`${value}/`+`${demo}`, function(data) {
        updateDemo(data, value, demo);
    });
}
// function attached to event listener in html for the option chaanges for 
// selecting Progam Type on Program Volume Row
function optionChangedVolume(value) {
    d3.json(volume_url+`${value}`, function(data) {
        var volume_data = unpackVolume(data);
        buildYearlyBar(volume_data);
        buildYearlyDistinctBar(volume_data);
    });
}

function optionChangedDemo(value) {
    var selected = document.getElementById('selDataset');
    var year = selected.options[selected.selectedIndex].value;
    if (year === 'Year') {
        year = '2018'
    }
    d3.json(demo_url+`${year}/`+`${value}`, function(data) {
        updateDemo(data, year, value);
    });
}


