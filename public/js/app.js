/*global jQuery, Handlebars, Router */
// jQuery(function ($) {
	'use strict';

	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	
  function uuid() {
    /*jshint bitwise:false */
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
  }

  function pluralize(count, word) {
    return count === 1 ? word : word + 's';
  }

  function store(namespace, data) {
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      var store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
  }

  function bindEvents() {
    
    // $('#new-todo').on('keyup', create.bind(App));
    document.getElementById('new-todo').addEventListener('keyup', create.bind(App));
    // $('#toggle-all').on('change', toggleAll.bind(App));
    document.getElementById('toggle-all').addEventListener('change', toggleAll.bind(App));
    // $('#footer').on('click', '#clear-completed', destroyCompleted.bind(App));
    document.getElementById('footer').addEventListener('click', function(e) {
      var clearCompletedButton = document.getElementById('clear-completed');
        if (e.target === clearCompletedButton){
          destroyCompleted();
        }
    });
    
    // the id for the ul in index/html is todo-list
    var todolist = document.getElementById('todo-list');
    
    // toggle
    todolist.addEventListener('change', function(e) {
      if(e.target.className === 'toggle') {
        toggle(e);
      }
    });
    
    
    // edit
    todolist.addEventListener( 'dblclick', function(e) {
    // console.log(e.target.nodeName);
      if(e.target.nodeName === 'LABEL') {
        edit(e);
      }
    });
    
    //editKeyup
    todolist.addEventListener('keyup', function(e){
      if(e.target.className === 'edit'){
        editKeyup(e);
      }
    });
    
    //update
    todolist.addEventListener('focusout', function(e){
      if(e.target.className === 'edit'){
        update(e);
      }
    });
    
    //destroy
    todolist.addEventListener('click', function(e){
      if(e.target.className === 'destroy'){
        destroy(e);
      }
    });
    
    
//     $('#todo-list')
//       .on('change', '.toggle', toggle.bind(App))
//       .on('dblclick', 'label', edit.bind(App))
//       .on('keyup', '.edit', editKeyup.bind(App))
//       .on('focusout', '.edit', update.bind(App))
//       .on('click', '.destroy', destroy.bind(App));
  } // end of bindEvents function
  
  function create(e) {
    // var $input = $(e.target);
    // var val = $input.val().trim();
    var input = e.target;
    var val = input.value.trim();

    if (e.which !== ENTER_KEY || !val) {
      return;
    }

    App.todos.push({
      id: uuid(),
      title: val,
      completed: false
    });

    input.value = '';

    render();
  }
  
  function destroy(e) {
    App.todos.splice(indexFromEl(e.target), 1);
    render();
	} 
  
  function destroyCompleted() {
			App.todos = getActiveTodos();
			App.filter = 'all';
			render();
	}
  
  function edit(e) {
		// var $input = $(e.target).closest('li').addClass('editing').find('.edit');
		// $input.val($input.val()).focus();
    
    // assign target and closest to myLi variable
    var myLi = e.target.closest('li');
    //add className
    myLi.classList.add('editing');
    // // Without jQuery
    // // Select the first instance of .edit within myLi ===> label we wanna edit
    // var myLi = e.target.closest('li');
    // // next... myLi.querySelector(''.edit');
    // example use queryselector all then use queryselector 

    //
    var myInput = myLi.querySelector('.edit');
   
    myInput.focus();
    
	}
  
  function editKeyup(e) {
    if (e.which === ENTER_KEY) {
      e.target.blur();
    }

    if (e.which === ESCAPE_KEY) {
      console.log(todoLi);
      // $(e.target).data('abort', true).blur();
      // .data Description: Store arbitrary data associated with the matched elements.
      //.data( key, value )
      // solution could be Element.setAttribute(name, value); it is not
      // soultion could set attribute using dataset
      // from mdn article.dataset.columns = 5 would change that attribute to "5".
      // create a var for element.target
      var todoLi = e.target;
      // console.log(todoLi); 
      // <--- prove that when you hit escape e.target is 

      todoLi.dataset.abort = true;
      todoLi.blur();
    }
  }  
  
  function getActiveTodos() {
    return App.todos.filter(function (todo) {
      return !todo.completed;
    });
	}
  
  function getCompletedTodos() {
    return App.todos.filter(function (todo) {
      return todo.completed;
    });
	}
  
  function getFilteredTodos() {
    if (App.filter === 'active') {
      return getActiveTodos();
    }

    if (App.filter === 'completed') {
      return getCompletedTodos();
    }

    return App.todos;
  }
  
  function indexFromEl(el) {
    
    	// var id = $(el).closest('li').data('id'); original code
    
    // find the closest li on el
    // find the closest li, var id = el.closest('li')
    // then find its data set .. .dataset.id;
    
      var id = el.closest('li').dataset.id;
			var todos = App.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
	}
  
  function init() {
			App.todos = store('todos-jquery');
      // need to assign a variable for the todo-template
      // need to assign a variable for the footer-template
      var todoTemplateElement = document.getElementById('todo-template');
      var footerTemplateElement = document.getElementById('footer-template');
			// App.todoTemplate = Handlebars.compile($('#todo-template').html());
			// App.footerTemplate = Handlebars.compile($('#footer-template').html());    
			App.todoTemplate = Handlebars.compile(todoTemplateElement.innerHTML);
			App.footerTemplate = Handlebars.compile(footerTemplateElement.innerHTML);
			bindEvents();

      new Router({
				'/:filter': function (filter) {
					App.filter = filter;
					render();
				}.bind(App)
			}).init('/all');      
	}
  
  function render() {
    var todos = getFilteredTodos();
    var todoList = document.getElementById('todo-list');
    todoList.innerHTML = App.todoTemplate(todos);
    var mainElement = document.getElementById('main');
    if (todos.length > 0) {
      mainElement.style.display = 'block';
    } else {
      mainElement.style.display = 'none';
    }
    var toggleAllElement = document.getElementById('toggle-all');
    if (toggleAllElement.checked) {
      getActiveTodos().length === 0;
    }
    renderFooter();
    var newTodoElement = document.getElementById('new-todo');
    newTodoElement.focus();
    store('todos-jquery', App.todos);
	}
  
  function renderFooter() {
    var todoCount = App.todos.length;
    var activeTodoCount = getActiveTodos().length;
    var template = App.footerTemplate({
      activeTodoCount: activeTodoCount,
      activeTodoWord: pluralize(activeTodoCount, 'item'),
      completedTodos: todoCount - activeTodoCount,
      filter: App.filter
    });
    
    if (todoCount > 0) {
      var theFooter = document.getElementById('footer');
      theFooter.innerHTML = template;
      theFooter.style.display = 'block';
      
    }
    
  
    // $('#footer').toggle(todoCount > 0).html(template);
  }
  
  function toggle(e) {
    var i = indexFromEl(e.target);
    App.todos[i].completed = !App.todos[i].completed;
    render();
	}
  
  function toggleAll(e) {
    // var isChecked = $(e.target).prop('checked');
    var isChecked = e.target.checked;

    App.todos.forEach(function (todo) {
      todo.completed = isChecked;
    });

    render();
	}
//   function update(e) {
// 			var el = e.target;
// 			var $el = $(el);
// 			var val = $el.val().trim();

// 			if (!val) {
// 				destroy(e);
// 				return;
// 			}

// 			if ($el.data('abort')) {
// 				$el.data('abort', false);
// 			} else {
// 				App.todos[indexFromEl(el)].title = val;
// 			}

// 			render();
// 	}
  function update(e) {
			var el = e.target;
			
			var val = el.value.trim();

			if (!val) {
				destroy(e);
				return;
			}

			if (el.dataset.abort) {
				el.dataset.abort = false;
			} else {
				App.todos[indexFromEl(el)].title = val;
			}

			render();
	}  
  
	var App = {};

	init();
  
// });