//-------------------------------------------Backend-----------------------------------------------------------------------


var budgetController = (function(){
    
   var expense = function(id, description, value){
       this.id = id;
       this.description = description;
       this.value = value;
       this.percentage = -1;
   };
   var income = function(id, description, value){
       this.id = id;
       this.description = description;
       this.value = value;
   };
    
    expense.prototype.calcPercentage = function(totalIncome){
      if(totalIncome > 0){
          this.percentage = Math.round((this.value/totalIncome)*100);
      }  
        else{
            this.percentage = -1;
        }
        
    };
    
    expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
           sum+= cur.value; 
            
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            if(data.allItems[type].length>0){ 
            ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }
            else {
                ID = 0;
            }
            if(type === 'exp'){
                newItem = new expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new income(ID, des, val);
            }
            //push it into our data structure
                data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, id){
          var ids, index;
            ids = data.allItems[type].map(function(current){
               return current.id; 
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that we spent
            if(data.totals.inc > 0){ 
            data.percentage = Math.round((data.totals.exp / data.totals.inc) *100);
            }
            else{
                data.percentage  = 0;
            }
        },
        calculatePercentages: function(){  //doubt 1.0
            
            data.allItems.exp.forEach(function(cur){
               cur.calcPercentage(data.totals.inc); 
            
            });
            
        },
        getPercentages: function(){
          var allPerc = data.allItems.exp.map(function(cur){  //doubt 1.1
             return cur.getPercentage(); 
          });  
            return allPerc;
        },
        
        getBudget: function(){
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          };  
        },
        testing: function(){
           console.log(data);
        }
    };
    
    
})();


//---------------------------------------UI Frontent-----------------------------------------------------------------------------


var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescripton: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    var formatNumber = function(num, type){
            var numSplit, int, dec, type;
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');
            int = numSplit[0];
            dec = numSplit[1];
            if(int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3,int.length);
            }
            return (type === 'exp'? '-': '+') + ' '+ int + '.' + dec;
        };
    
         var nodeListForEach = function(list, callback){
               for(var i =0 ; i<list.length; i++){
                   callback(list[i], i);
               }          
         };
    
    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescripton).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        addListItem: function(obj,type){
            var html, newHtml, element;
            // Create html string with placeholder text
            if(type === 'inc'){ 
                element = DOMstrings.incomeContainer;
           html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div> </div>';
            }
            else if(type ==='exp'){ 
                element = DOMstrings.expensesContainer;
           html =   '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>  </div></div></div>';
            }
             //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
                   
            // Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
         
        },
        deleteListItem: function(selectorID){                //doubt 2
          var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescripton + ', ' + DOMstrings.inputValue);
           // console.log(fields);
            fieldsArr = Array.prototype.slice.call(fields);
           // console.log(fieldsArr);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
                
            });
            
            fieldsArr[0].focus();
            
        },
        displayBudget: function(obj){
            var type;
            (obj.budget < 0)? type = 'exp': type = 'inc';
                
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
             document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
             document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
             if(obj.percentage > 0){ 
                 document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
             }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        displayPercentages: function(percentages){
          var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
           
            
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                     current.textContent =  percentages[index] + '%';
                }
                else{
                    current.textContent = '---';
             }
              
            });
            
        },
        displayMonth: function(){
          var now, year, month, months;  
            now = new Date();
            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month]  + ' ' + year;
        },
        changedType: function(){
            var fields = document.querySelectorAll(DOMstrings.inputType+','+ DOMstrings.inputDescripton+ ',' + DOMstrings.inputValue );
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');         
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        getDOMstrings: function(){
           return DOMstrings;
        }
    }
    
    
})();

//--------------------------------------------Main controller-----------------------------------------------------------------------------

var controller = (function(bdgtCntrl, uiCntrl){
    
    var setupEventListeners = function(){
           var DOM = uiCntrl.getDOMstrings(); 
           document.querySelector(DOM.inputBtn).addEventListener('click',cntrlAddItem);
           document.addEventListener('keypress', function(event){
           if(event.keyCode ===13 || event.which ===13){
           cntrlAddItem();
               
       }      
    }); 
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',uiCntrl.changedType);
        
    };
    
    var updateBudget = function(){
        //cal the budget
        bdgtCntrl.calculateBudget();
        
        //Return the budget
        var budget = bdgtCntrl.getBudget();
        
        //Display the budget on UI
        uiCntrl.displayBudget(budget);
    };
    
    var updatePercentages = function(){
        
        // calculate percentage
        bdgtCntrl.calculatePercentages();
        
        //read % from budget control
        var percentages = bdgtCntrl.getPercentages();
       
        // update ui with new %
       uiCntrl.displayPercentages(percentages);
    }
    
    var cntrlAddItem = function(){    
        
        //1. Get the field input data
        var input = uiCntrl.getInput();
        
        if(input.description!== "" && !isNaN(input.value) && input.value>0){ 
        //2. Add the item to the budget controller
        var newItem = bdgtCntrl.addItem(input.type, input.description, input.value);
        
        //3. Add the item to the UI
        uiCntrl.addListItem(newItem, input.type);
        
        // clear fields
        uiCntrl.clearFields();
        
        //4. calculate n update the budget
        updateBudget();
        
        }
       
            //calculate and update %
            updatePercentages();
         
    }
    
    var ctrlDeleteItem = function(event){
        
      var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
      //  console.log(itemID);
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //delete the item from the data structure
            bdgtCntrl.deleteItem(type,ID);
            // delete the item form UI
            uiCntrl.deleteListItem(itemID);
            // update and show the new budget
            updateBudget();
            //calculate and update %
            updatePercentages();
        }
        
    };
    
    return {
        init: function(){  
            uiCntrl.displayBudget({
              budget: 0,
              totalInc: 0,
              totalExp: 0,
              percentage: -1
            
        });
           uiCntrl.displayMonth(); 
            setupEventListeners();
        }
    }
    
})(budgetController, UIController); 

controller.init();

//-----------------------------------------------------------------End-----------------------------------------------

 