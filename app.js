require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');




const app=express();
app.set('view engine','ejs');//this is for ejs file system;
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));//this for css 


main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}



const itemSchema=new mongoose.Schema({
    name:String
})

const Item=mongoose.model("itemlist",itemSchema);





const item1=new Item({
  name:"welcome to your todo list"
});

const item2=new Item({
  name:"hit the + button to add new item"
});

const item3=new Item({
  name:"hit the - button to remove item"
});

const defaultitems=[item1,item2,item3];
// Item.insertMany([item1,item2,item3]).then(function(){
//   console.log("Successfully saved all the fruist to listDB.");
// }).catch(function(err)
// {
//   console.log(err);
// });


const listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
})

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find()
    .then(items => {
      if (items.length === 0) {
        Item.insertMany(defaultitems)
          .then(() => {
            console.log("Added");
            res.redirect("/");
          }) 
          .catch(err => {
            console.log(err);
          });
      } else {
        res.render("list", { listTitle: "Today", newListitems: items});
      }
    })
    .catch(err => {
      console.log(err);
    });
}); 


app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  console.log(customListName);

  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultitems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // Show an existing list
        res.render("list",{
          listTitle: foundList.name,
          newListitems: foundList.items,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});




app.post('/', function(req, res) {
  const newitem = req.body.newItem;
  let listName = req.body.list;  
   if (listName) {    listName = listName.trim();}
   // get the list name from the hidden input field

  //  console.log(listName);
  const item4 = new Item({
    name: newitem
  });
  if (listName === "Today") {
    item4.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listName })
      .then(function(foundList) {
        foundList.items.push(item4);
        foundList.save();
        res.redirect('/' + listName);
      })
      .catch(function(err) {
        console.log(err);
      });
  }
});


app.post('/delete',function(req,res){
  const deleteitem=req.body.checkbox;
  const listName=req.body.list;
  // if (listName) {    listName = listName.trim();}
   console.log(listName);
   if(listName==="Today")
   {
    Item.findByIdAndRemove(deleteitem).then(function(){
      console.log("Successfully deleted")
      res.redirect('/');
    })
   }
   else{
     List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: deleteitem}}}, {
        new: true
      }).then(function (foundList)
      {
        res.redirect("/" + listName);
      }).catch( err => console.log(err));
  }
 

});
const PORT = process.env.PORT || 3000;
 
app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});





