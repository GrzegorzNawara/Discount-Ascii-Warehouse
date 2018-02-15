"use strict";

const DATA_SET_SEPARATOR="\n";
const DATA_PAGE_SIZE=24;
const SHOW_RELATIVE_DATE=7; //Show when the date is closer than X days
const PRE_LOAD_WHEN_CLOSER_THAN_X_TIMES_THE_PAGE_HEIGHT=10;
const ADD_ADS_AFTER_EVERY_X_PRODUCTS=20;

let moduleDAW = function(){

  // Simple lock for reading data
  let loadingDataNow=0;

  // End of data marker
  let endOfData=0;

  // Actual data page to be read
  let actualPage=0;

  // Ads positioning
  let lastAddPosition=0;
  let currentRecordPosition=0;
  let lastAdsId=0;

  // Sorting
  let actualSorting="price";

  // Smoke tests
  //console.log(tr('__CHECK_TR__'));



  // ------------------------------------------------------------------------------------------
  // Basic translation solution to work with trados
  // TODO: Read userLang from browser with Gen-US
  let userLang="pl-pl";//window.navigator.userLanguage || window.navigator.language;
  userLang=userLang.substring(0,2);

  moment.locale(userLang);

  let multiLang=["en","pl"];
  multiLang["en"]=["__CHECK_TR__","Today","Yesterday","days ago"];
  multiLang["pl"]=["__TR_PL_OK__","Dziś","Wczoraj","dni temu"];

  function tr(word) {

    try {

      return multiLang[userLang][multiLang["en"].indexOf(word)];
    }
    catch (e) {

      return word;
    }
  }
  // Basic translation function
  // ------------------------------------------------------------------------------------------



  // ------------------------------------------------------------------------------------------
  // Grid sorting switch
  function sort(element, by_field) {

     // Checking the lock
      if(loadingDataNow==0) {

        let tmp_sorting;
        let tmp_whole_recordset;

         // Lock
        loadingDataNow=1;

        // Show active sorting
        tmp_sorting = document.getElementById("sorting");
        for (let tmp_ii = 0; tmp_ii < tmp_sorting.children.length; tmp_ii++) {

            tmp_sorting.children[tmp_ii].classList.remove("active");
        }
        element.classList.add("active");

        // Set new sorting
        actualSorting=by_field;

        // Reset data
        actualPage=0;
        lastAddPosition=0;
        currentRecordPosition=0;
        lastAdsId=0;
        endOfData=0;

        // Destroy resultset
        tmp_whole_recordset = document.getElementById("main-product-grid");
        while (tmp_whole_recordset.firstChild) {
            tmp_whole_recordset.removeChild(tmp_whole_recordset.firstChild);
        }


        // Unlock
        loadingDataNow=0;

        // Load data
        load_more();
      }
  }
  // Grid sorting switch
  // ------------------------------------------------------------------------------------------



  // ------------------------------------------------------------------------------------------
  // Data pre-load
  document.body.onload = function() {load_more()};
  window.onscroll = function() {load_more()};

  function load_more() {

    let tmp_scroll_position;
    let tmp_pre_loader_distance;
    let tmp_hidden_elements;



    // Check if we need to pre-load
    tmp_scroll_position = (document.body.scrollTop || document.documentElement.scrollTop );
    tmp_pre_loader_distance = document.getElementById("pre-loader").offsetTop - tmp_scroll_position;

    // Checking the lock
    if(loadingDataNow==0 && endOfData==0) {

      if ( tmp_pre_loader_distance < PRE_LOAD_WHEN_CLOSER_THAN_X_TIMES_THE_PAGE_HEIGHT*window.innerHeight ) {

          console.log("load_more");

          // Read next page
          //console.log("Load more::"+loadingDataNow+":"+actualPage);
          read_data();
      }
    }


      //Showing preloaded data when visible
      tmp_hidden_elements=document.getElementsByClassName("hidden");
      for (let tmp_ii = 0; tmp_ii < tmp_hidden_elements.length; tmp_ii++) {

          if(tmp_hidden_elements[tmp_ii].offsetTop - tmp_scroll_position < window.innerHeight) {

            tmp_hidden_elements[tmp_ii].classList.remove("hidden");
          }
      }


  }
  // Data pre-load
  // ------------------------------------------------------------------------------------------



  //---------------------------------------------------------------------------
  // Parse the data
  function parse_data(dataLoaded){

    let dataSet;

    // Init before reading recordset
    endOfData=1;

    // Read data recordset
    dataSet = dataLoaded.split(DATA_SET_SEPARATOR);
    dataSet.forEach(function a (item, index) {

      let dataRecord=null;

      //console.log(dataSet[index]);
      // If valid record
      if(dataSet[index]!="") {

        let tmp_new_record;

        // At least 1 non-empty record exists
        endOfData=0;

        // Read data with values convertion
        dataRecord = JSON.parse(dataSet[index], convert_data_values );

        // Update record position (for ads)
        currentRecordPosition++;

        //console.log(currentRecordPosition);

        // Display adds
        if( currentRecordPosition-lastAddPosition>=ADD_ADS_AFTER_EVERY_X_PRODUCTS ) {

          let tmp_image_id;
          let tmp_new_ad;

           // Choose an ad
           // Make sure there are never twice the same ad
           tmp_image_id=Math.floor(Math.random()*1000);
           if(tmp_image_id==lastAdsId) {

            tmp_image_id=(tmp_image_id+1)%1000;
           }
           lastAdsId=tmp_image_id;

            // Fill dummy ad
           document.getElementById("ad-image").src="/ad/?r="+tmp_image_id;
           tmp_new_ad = document.getElementById("ad-dummy").cloneNode(true);
           tmp_new_ad.classList.remove("dummy");
           tmp_new_ad.classList.add("hidden");

           // Show ads on first page
           if(actualPage==0) {

            tmp_new_ad.classList.remove("hidden");
          }

          // Removing ids
          tmp_new_ad.removeAttribute("id");
          for (let tmp_ii = 0; tmp_ii < tmp_new_ad.children.length; tmp_ii++) {
            tmp_new_ad.children[tmp_ii].removeAttribute("id");
          }


          // Put new element on the grid
          document.getElementById("main-product-grid").appendChild(tmp_new_ad);


           lastAddPosition=currentRecordPosition;
        }


        // Display data row
        // Fill dummy record with data
        // Div elements in record-dummy children provides data field-names
        // Example: <div id="data-price"></div> // this will load data from "price" field
        for (let tmp_data_field in dataRecord) {

            if (dataRecord.hasOwnProperty(tmp_data_field)) {

                if( document.getElementById("data-"+tmp_data_field) != null ) {

                  document.getElementById("data-"+tmp_data_field).innerHTML=dataRecord[tmp_data_field];
                }
            }
        }


        // Setting face size
        document.getElementById("data-face").style.fontSize=dataRecord.size+"px";


        // Create new row with updated element identifiers
        tmp_new_record = document.getElementById("record-dummy").cloneNode(true);
        tmp_new_record.removeAttribute("id");
        for (let tmp_ii = 0; tmp_ii < tmp_new_record.children.length; tmp_ii++) {
            tmp_new_record.children[tmp_ii].removeAttribute("id");
            // Id is never used
            //setAttribute("id", dataRecord.id+"-"+tmp_new_record.children[tmp_ii].id);
        }
         tmp_new_record.classList.remove("dummy");
         tmp_new_record.classList.add("hidden");

        // Show new record during initial loading
        // Next pages will be shown after scrolling
        if(actualPage==0) {

          tmp_new_record.classList.remove("hidden");
        }

        // Put new element on the grid
        document.getElementById("main-product-grid").appendChild(tmp_new_record);

      }
      // If valid record

    });
    // Read data recordset


    // Hide/show end-of-catalogue-message
    if(endOfData==1) {

      document.getElementById("end-of-catalogue-message").style="";
    }
    else {

      document.getElementById("end-of-catalogue-message").style="display:none";
    }



    // Inc actual page for next query
    actualPage++;

    // Unlock
    loadingDataNow=0;

    // Hide loader
    document.getElementById("loading-message").style="display:none";

  }
  // parse the data
  //---------------------------------------------------------------------------




  // ------------------------------------------------------------------------------------------
  // Main data loader
  function read_data() {

    // Lock
    loadingDataNow=1;

    // Show loader
    document.getElementById("loading-message").style="";

    // Use window.fetch with promises when possible
    if (self.fetch) {

        // Run fetch request

        fetch("api/products?limit="+DATA_PAGE_SIZE+"&skip="+(actualPage*DATA_PAGE_SIZE)+"&sort="+actualSorting)
          .then(function(response) {
            if(response.ok) {
              return response.text();
            }
            //throw new Error('Network response was not ok.');
          })
          .then(function(responseText) {

            console.log("Fetch used");
            parse_data(responseText);
          })
          .catch(function(error) {

            //console.log('There has been a problem with your fetch operation: ', error.message);

            // Try to recover
            setTimeout(function () {

              loadingDataNow=0;
              load_more();

            }, 5000);

          });
    }
    else {

        // Use XMLHttpRequest
        let xhttp = new XMLHttpRequest();
        xhttp.onerror = function() {

          // Try to recover
          setTimeout(function () {

            loadingDataNow=0;
            load_more();

          }, 5000);
        }
        xhttp.onreadystatechange = function() {

          if (this.readyState == 4 && this.status == 200) {

            //console.log("XHR used");
            parse_data(this.responseText);
          }
        };
        xhttp.open("GET", "api/products?limit="+DATA_PAGE_SIZE+"&skip="+(actualPage*DATA_PAGE_SIZE)+"&sort="+actualSorting, true);
        xhttp.send();
    }

  }
  // Main data loader
  // ------------------------------------------------------------------------------------------



  // ------------------------------------------------------------------------------------------
  // Converting data for display
  function convert_data_values(key, value) {

    // Date conversion
    // TODO: Use data type "date" instead of a field name
    if (key == "date") {

        let tmp_current_date=new Date(value);

        if( moment(tmp_current_date.toISOString()).diff(
              moment().subtract(SHOW_RELATIVE_DATE, 'days'), "days" )<=0) {

          // Return relative date
          return moment(tmp_current_date.toISOString()).format('LL');
        }
        else {

          // Return relative date
          return moment(tmp_current_date.toISOString()).startOf('day').fromNow();
        }


        /*
        // Replaced with moment.js

        let tmp_days_passed = Math.floor( (Date.now() - tmp_current_date.getTime()) / 1000 / 3600 / 24 );

        if(tmp_days_passed < SHOW_RELATIVE_DATE) {

          // Return relative date
          // Today
          if(tmp_days_passed<1) {

            return tr("Today");
          }
          else if(tmp_days_passed==1) {

            return tr("Yesterday");
          }
          else {

            // Some days ago
            return tmp_days_passed+" "+tr("days ago");
          }

        }
        else {

          // Return full date ISO
          // TODO: Use user defined date format
          return tmp_current_date.getFullYear()+"-"+("0"+(tmp_current_date.getMonth()+1)).slice(-2)+"-"+("0"+tmp_current_date.getDate()).slice(-2);
        }
        */
    }
    // Date conversion


    // Money conversion
    // TODO: Use data type "money" instead of a field name
    if (key == "price") {

        // TODO: Add currencies, number formatting, dot/comma from translation
        let tmp_price="$"+Math.floor(value/100)+"."+("0"+(value%100)).slice(-2);

        return tmp_price;
    }
    // Money conversion


    // Nothing to convert
    return value;

  }
  // Converting data for display
  // ------------------------------------------------------------------------------------------


  return{sort:sort}
}();

//EOF
