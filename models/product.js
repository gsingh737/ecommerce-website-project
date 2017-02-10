var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;

var productSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId, ref: 'Category',
      es_type:'nested', es_include_in_parent:true
    },
    name: String,
    price: Number,
    image: String
  }
);

productSchema.plugin(mongoosastic, {
  hosts: [
    'localhost:9200'
  ],
  populate: [
    {
      path: 'category'
    }
  ]
});

module.exports = mongoose.model('Product', productSchema);
