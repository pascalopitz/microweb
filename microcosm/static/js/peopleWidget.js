(function(){

  var PeopleWidget = (function(){

    var peopleWidget = function(options){

      if (typeof options.el !== 'undefined'){
        this.$el = $(options.el);
      }

      this.people = [];
      if(typeof options.people !== 'undefined'){
        this.people = options.people;
      }
      this.people_invited = [];
      if(typeof options.invited !== 'undefined'){
        this.people_invited = options.invited;
      }

      this.isActive = false; // flag to keep the popover from closing

      this.container    = this.createWidgetContainer();
      this.widget_form  = this.createWidgetForm();
      this.widget_list  = this.createWidgetList();
      this.popover      = this.createPopover();

      this.is_textbox = false;
      if (typeof options.is_textbox !== 'undefined' &&
          options.is_textbox === true){
        this.is_textbox = true;
        this.widget_input = this.$el[0];
      }else{
        this.widget_input = this.createWidgetInput();
        this.container.appendChild(this.widget_input);
      }

      this.widget_form.appendChild(this.widget_list);
      this.container.appendChild(this.widget_form);

      this.popover.appendChild(this.container);

      document.body.appendChild(this.popover);

      this.bind();
    };


    peopleWidget.prototype.createWidgetContainer = function(){
      var widget_container = document.createElement('div');
      widget_container.className = "people-widget";
      return widget_container;
    };

    peopleWidget.prototype.createWidgetForm = function(){
      var widget_form = document.createElement('form');
      return widget_form;
    };

    peopleWidget.prototype.createWidgetInput = function(){
      var widget_input  = document.createElement('input');
      widget_input.type = "text";
      widget_input.placeholder = "Enter a username...";
      widget_input.autocomplete = "off";
      return widget_input;
    };

    peopleWidget.prototype.createWidgetList = function(){
      var widget_list  = document.createElement('ul');
      widget_list.className = "people-widget-list";
      return widget_list;
    };

    peopleWidget.prototype.createSubmitButton = function(){
      var button = document.createElement('input');
      button.type = 'submit';
      button.value = 'Invite';

      return button;
    };

    peopleWidget.prototype.createPopover = function(){

      var popover = document.createElement('div');
      popover.className       = "people-widget-popover";
      popover.style.display  = 'none';
      popover.style.position = 'absolute';
      return popover;
    };

    peopleWidget.prototype.ItemPerson = function(descriptor){
      var link    = document.createElement('a'),
          name    = document.createTextNode(),
          avatar  = document.createElement('img');

      avatar.src       = descriptor.image;
      name.textContent = descriptor.name;

      link.id          = descriptor.id;
      link.appendChild(avatar);
      link.appendChild(name);

      return link;
    };

    peopleWidget.prototype.addPersonToInvitedById = function(id){

      var query_id, invited;

      query_id = parseInt(id,10);
      invited = this.people.filter(function(person){
        return person.id === query_id;
      });

      this.people_invited.push(invited[0]);
      this.render();

      if(typeof this.onSelection !== 'undefined' &&
        typeof this.onSelection === 'function'){
        this.onSelection(this.people_invited);
      }
    };

    peopleWidget.prototype.excludeInvitedPeople = function(list){

      var invited_ids = [],
          new_list    = [];

      if (this.people_invited.length > 0){
        for(var i=0,j=this.people_invited.length;i<j;i++){
          invited_ids.push(this.people_invited[i].id);
        }
        new_list = list.filter(function(person){
          return invited_ids.indexOf(person.id) === -1;
        });
      }else{
        new_list = list;
      }

      return new_list;
    };

    peopleWidget.prototype.filterPeopleListByName = function(name){
      var filteredPeople = [];
      if(this.people.length>0){
        for(var i=0,j=this.people.length;i<j;i++){
          if (this.people[i].name.indexOf(name)>-1){
            filteredPeople.push(this.people[i]);
          }
        }
      }
      return filteredPeople;
    };

    peopleWidget.prototype.sortPeopleListByName = function(list){
      return list.sort(function(a,b){ return b.name < a.name; });
    };

    peopleWidget.prototype.clearPeopleList = function(){
      this.widget_list.innerHTML = "";
      return this;
    };

    peopleWidget.prototype.renderPeopleList = function(list, options){

      var li, entry;

      for(var i=0,j=list.length;i<j;i++){

        li = document.createElement('li');
        if (typeof options !== 'undefined' &&
            typeof options.className !== 'undefined'){
          li.className = options.className;
        }

        entry = this.ItemPerson(list[i]);
        li.appendChild(entry);
        if (typeof entry.id !== 'undefined'){
          li.rel = entry.id;
        }
        this.widget_list.appendChild(li);
      }
      return this;
    };

    peopleWidget.prototype.render = function(){

      var query, list;

      this.clearPeopleList();

      list = this.sortPeopleListByName(this.people_invited);
      this.renderPeopleList(list,{ className : 'invited'});

      query = this.widget_input.value;

      if ($.trim(query)!==""){
        list = this.filterPeopleListByName(query);
        list = this.excludeInvitedPeople(list);

        if (list.length>0){
          this.renderPeopleList(this.sortPeopleListByName(list));
        }else{
          if (this.people_invited.length === 0){
            var empty = document.createElement('li');
            empty.textContent = "No results";
            this.widget_list.appendChild(empty);
          }
        }
      }
    };

    peopleWidget.prototype.reset = function(){
      this.widget_input.value = "";
      this.clearPeopleList();
      this.people_invited = [];
    };

    peopleWidget.prototype.calcTriggerOffset = function(){

      var offset = this.$el.offset();
      offset.top = offset.top + this.$el.outerHeight();
      offset.left = offset.left + (this.$el.outerWidth()/2);

      return offset;

    };

    peopleWidget.prototype.calcPopoverPosition = function(){

      var offset = this.calcTriggerOffset();
      if (this.is_textbox){
        offset.left = offset.left - (this.$el.outerWidth()/2);
      }else{
        offset.top = offset.top + 10;
        offset.left = offset.left - (this.popover.offsetWidth/2);
      }

      this.popover.style.top  = offset.top + 'px';
      this.popover.style.left = offset.left + 'px';

      return this;
    };

    peopleWidget.prototype.show = function(){
      this.popover.style.display = "block";
      this.calcPopoverPosition();
      this.widget_input.focus();
    };

    peopleWidget.prototype.hide = function(e){
      this.popover.style.display = "none";
    };

    peopleWidget.prototype.changeHandler = function(e){
      this.render();
    };

    peopleWidget.prototype.clickHandler = function(e){
      var self = e.currentTarget;
      e.stopPropagation();
      if (typeof self.rel !== 'undefined'){
        this.addPersonToInvitedById(self.rel);
      }
    };

    peopleWidget.prototype.submitHandler = function(e){
      e.preventDefault();
    };

    peopleWidget.prototype.onSelection = function(fn){
      if (typeof fn === 'function'){
        this.onSelection = $.proxy(fn,this);
      }
      return this;
    };

    peopleWidget.prototype.bind = function(){

      $(this.widget_input).on('keyup', $.proxy(this.changeHandler,this));
      $(this.container).on('click', 'li:not(.invited)', $.proxy(this.clickHandler,this));


      if (this.is_textbox){

        this.$el.on('focus', $.proxy(this.show,this));

      }else{
        this.$el.on('click', $.proxy(function(){
          if (this.popover.style.display === "block"){
            this.hide();
          }else{
            this.show();
          }
        },this));
      }

      $('body').on('click', $.proxy(function(){ this.hide(); },this));
      $(this.container).on('click', function(e){ e.stopPropagation(); });
      this.$el.on('click', function(e){ e.stopPropagation();});

    };

    return peopleWidget;

  })();

  window.PeopleWidget = PeopleWidget;

})();