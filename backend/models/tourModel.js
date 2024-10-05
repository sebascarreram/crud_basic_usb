const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');

////////////////////
//// Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A name tour is required'],
      unique: true,
      trim: true, // "    Hello world.     " <- delete space
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
      default: 4.5
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 // 4,66667 => 46,6666 => 47 => 4,7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        // this only points to current doc on NEW document creation
        validator: function(val) {
          return val < this.price; // 100 < 200 => 100 is less than 200. it's true
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true // "    Hello world.     " <- delete space
    },
    description: {
      type: String,
      // required: [true, 'A tour must have a description'],
      trim: true // "    Hello world.     " <- delete space
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: new Date(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      // an Array of Number
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // guides: Array
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review'
    //   }
    // ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//  1 or -1
//  1 => means sorting the price index in an ascending order
// -1 => means sorting the price index in a descending order
//
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
// const tourSchema = new mongoose.Schema({
//   name: {//     type: String,
//     required: [true, 'A name tour is required'],
//     unique: true
//   },
//   price: {
//     type: Number,
//     required: [true, 'A price tour is required']
//   }
// });

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
  // next();
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  // console.log(this);
  next();
});

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));

//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
/// '/^find/' -> for all commands that start with name field
/// example: find, findOne, findOneAndDelete, findOneAndRemove, findOneAndUpdate -> it means that don't let those for secretTour
tourSchema.pre(/^find/, function(next) {
  // tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt' // Hide this field if it's minus
  });
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

// tourSchema.pre('findOne', function(next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
