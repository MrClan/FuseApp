console.log('hello from BlogModule');
var Observable = require("FuseJS/Observable");

var data = Observable();
fetch('https://api.myjson.com/bins/2m70k')
.then(function(response) { return response.json(); })
.then(function(responseObject) {
  // call a function that fills the list
  populateList(responseObject);
});

function populateList(source) {
  //console.log(JSON.stringify(source));
    // for each item in source data...
  for (var i in source.quotes) {
    // create a new temporary object...
    // we will need an ID to find items by later, so we add it too!
    var tmp = {
      'id':data.length,
      'text':source.quotes[i].text,
      'by': source.quotes[i].by,
      'likes':Observable(0)
    };
    // and then add it to our data Observable
    data.add(tmp);
  }
};

module.exports = {
  quotesList: data,
  incrLikes: function(args){
    // data.forEach(function(item) {
    //   if (item.id == args.data.id) {
    //     args.data.likes.value = args.data.likes.value + 1; // refer to .value, because it is an Observable!
    //   }
    // });
    var curItem = this.quotesList.getAt(args.data.id);
    curItem.likes.value = curItem.likes.value + 1;
  }
};
