var budgetController = (function() {

    var Expense = function(id,description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0) 
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else    
            this.percentage = -1;
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum = sum + curr.value;
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
    }

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // Create new Id
            if (data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            else   
                ID = 0;

            // Create new Item bades on Expense or Income
            if(type ==='exp')
                newItem = new Expense(ID, des, val);
            else if(type === 'inc')
                newItem = new Income(ID, des, val);

            // push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new Item
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            ids= data.allItems[type].map(function(curr) {
                return curr.id;
            })

            index = ids.indexOf(id);

            if (index !== -1)
                data.allItems[type].splice(index, 1);
        },

        calculateBudget: function() {

            //Calculate total Income and Expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the Budget
            data.budget = data.totals.inc - data.totals.exp;
            
            //Calculate the percentage of income that was spent
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else 
                data.percentage = -1;
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(curr) {
                return curr.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }

})();

var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3)
            int =  int.substr(0 , int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        
        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : '+') + '' + int + '.' + dec;
    }

    var nodeListsForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            
            }else if(type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newHtml  = html.replace('%id%', obj.id);
            newHtml  = newHtml.replace('%description%', obj.description);
            newHtml  = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorId) {

            var el =  document.getElementById(selectorId);
            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(curr, ind, arr) {
                curr.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc': type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

            if(obj.percentage > 0)
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            else
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodeListsForEach(fields, function(current, index) {

                if(percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '---'
            })

        },

        displayMonth: function() {
            var now, month, months, year;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month= now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' '+ year;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListsForEach(fields, function(curr) {
                curr.classList.toggle('red-focus');
            })

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        getDOMStrings: function() {
            return DOMstrings;
        }
    };
})();


var controller = (function(budgetCtrl, UICtrl) {

    var setUpEventListeners = function () {

        var DOM = UICtrl.getDOMStrings() ;

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if(event.keyCode == 13 || event.which == 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
    };
    var updateBudget  = function() {

        //1. Calculate the Budget
        budgetCtrl.calculateBudget();

        //2. Return the Budget
        var budget = budgetCtrl.getBudget();

        //3. Display the Budget on the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {
        //1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        //2.Read the percentages from Budget Controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function() {
        var input, newItem;

        // 1.Get the input field data
        input = UICtrl.getinput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2.Add the item to the Budget Conrtoller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            //3. Add item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. clear the Fields
            UICtrl.clearFields();
            
            //5. Calculate and Update Budget
            updateBudget();

            //6. Calculate and Update Budget
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemId, splitId, type, Id;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId){

            splitId = itemId.split('-');
            type = splitId[0];
            Id   = parseInt(splitId[1]);

            //1. Delete the item from data structure
            budgetCtrl.deleteItem(type, Id);

            //2. Delete the item from UI
            UICtrl.deleteListItem(itemId);

            //3. Update the Budget
            updateBudget();
        }

    };

    return {
        init: function() {    
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            })
            setUpEventListeners();
        }
    }

})(budgetController,UIController);

controller.init();