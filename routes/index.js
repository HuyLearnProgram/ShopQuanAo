var express = require('express');
var router = express.Router();

var Cate = require('../model/Cate.js');
var Product = require('../model/Product.js');
var GioHang = require('../model/giohang.js');
var Cart = require('../model/Cart.js');

var countJson = function(json){
	var count = 0;
	for(var id in json){
			count++;
	}

	return count;
}

/* GET home page. */

router.get('/', async function (req, res) {
    try {
        const product = await Product.find();
        const cate = await Cate.find();
        res.render('site/page/index', { product, cate });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/cate/:name.:id.html', async function (req, res) {
    try {
        const data = await Product.find({ cateId: req.params.id });
        const cate = await Cate.find();
        res.render('site/page/cate', { product: data, cate: cate });
    } catch (err) {
        res.status(500).send(err.message);
    }
});


// router.get('/chi-tiet/:name.:id.:cate.html', async function (req, res) {
//     try {
//         const data = await Product.findById(req.params.id);
//         const pro = await Product.find({ cateId: data.cateId, _id: { $ne: data._id } }).limit(4);
//         res.render('site/page/chitiet', { data, product: pro });
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });
router.get('/chi-tiet/:name.:id.:cate.html', async function (req, res) {
    try {
        const data = await Product.findById(req.params.id);
        if (!data) {
            // Nếu không tìm thấy sản phẩm, trả về lỗi hoặc redirect
            return res.status(404).send('Product not found');
        }

        const pro = await Product.find({ cateId: data.cateId, _id: { $ne: data._id } }).limit(4);
        res.render('site/page/chitiet', { data, product: pro });
    } catch (err) {
        res.status(500).send(err.message);
    }
});





router.post('/dat-hang.html', function (req, res) {
	var giohang = new GioHang( (req.session.cart) ? req.session.cart : {items: {}} );
	var data = giohang.convertArray();
	
	var cart = new Cart({
		  name 		:  req.body.name,
		  email 	: req.body.email,
		  sdt 		: req.body.phone,
		  msg 		: req.body.message,
		  cart 		: data,
		  st 		: 0
	});

	cart.save().then(function(){
		req.session.cart = {items: {}};
		res.redirect('/');
	});
	
});



router.get('/dat-hang.html', function (req, res) {
	var giohang = new GioHang( (req.session.cart) ? req.session.cart : {items: {}} );
	//var data = giohang.convertArray();
	
	if(req.session.cart){
		if(countJson(req.session.cart.items) > 0){
			res.render('site/page/check', {errors: null});
		}else res.redirect('/');
		
	}else{
		res.redirect('/');
	}
});





// router.post('/menu', function (req, res) {
//  	Cate.find().then(function(data){
//  		 res.json(data);
//  	});
// });
router.post('/menu', async function (req, res) {
    try {
        // Use async/await to fetch data from the database
        const data = await Cate.find();
        res.json(data);  // Return the data as JSON
    } catch (err) {
        // Handle any errors
        res.status(500).json({ message: 'Error occurred: ' + err.message });
    }
});


// router.get('/add-cart.:id', function (req, res) {
// 	var id = req.params.id;

// 	var giohang = new GioHang( (req.session.cart) ? req.session.cart : {items: {}} );
	
// 	Product.findById(id).then(function(data){
// 		giohang.add(id, data);
// 		req.session.cart = giohang;
// 		res.redirect('/gio-hang.html');
// 	});

   
// });

router.get('/add-cart.:id', async function (req, res) {
    try {
        const data = await Product.findById(req.params.id);
        const giohang = new GioHang(req.session.cart ? req.session.cart : { items: {} });
        giohang.add(req.params.id, data);
        req.session.cart = giohang;
        res.redirect('/gio-hang.html');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// router.get('/add-cart.:id', async function (req, res) {
//     try {
//         const data = await Product.findById(req.params.id);
        
//         if (!data) {
//             return res.status(404).send('Sản phẩm không tồn tại');
//         }

//         const giohang = new GioHang(req.session.cart ? req.session.cart : { items: {} });
//         giohang.add(req.params.id, data);
//         req.session.cart = giohang;
//         res.redirect('/gio-hang.html');
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });


router.get('/gio-hang.html', function (req, res) {
	var giohang = new GioHang( (req.session.cart) ? req.session.cart : {items: {}} );
	var data = giohang.convertArray();

   	res.render('site/page/cart', {data: data});
});

router.post('/updateCart', function (req, res) {
	var id 			= req.body.id;;
	var soluong 	= req.body.soluong;
	var giohang 	= new GioHang( (req.session.cart) ? req.session.cart : {items: {}} );

	giohang.updateCart(id, soluong);
	req.session.cart = giohang;
	res.json({st: 1});
	
});

router.post('/delCart', function (req, res) {
	var id 			= req.body.id;
	var giohang 	= new GioHang( (req.session.cart) ? req.session.cart : {items: {}} );

	giohang.delCart(id);
	req.session.cart = giohang;
	res.json({st: 1});
	
});

router.get('/test', function (req, res) {
   res.send('a');
});


module.exports = router;

// var express = require('express');
// var router = express.Router();
// var Cate = require('../model/Cate.js');

// // Function to remove Vietnamese accents
// function bodauTiengViet(str) {
//     str = str.toLowerCase();
//     str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
//     str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
//     str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
//     str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
//     str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
//     str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
//     str = str.replace(/đ/g, "d");
//     str = str.replace(/ /g, "-");
//     str = str.replace(/\./g, "-");
//     return str;
// }

// /* GET home page */
// router.get('/', checkAdmin, (req, res) => {
//     res.redirect('/admin/cate/danh-sach.html');
// });

// /* GET danh sach (category list) */
// router.get('/danh-sach.html', checkAdmin, async (req, res) => {
//     try {
//         const data = await Cate.find();  // Use async/await instead of callback
//         res.render('admin/cate/danhsach', { data: data });
//     } catch (err) {
//         res.status(500).send('Error occurred: ' + err.message);
//     }
// });

// /* GET them cate (add category) form */
// router.get('/them-cate.html', checkAdmin, (req, res) => {
//     res.render('admin/cate/them', { errors: null });
// });

// /* POST them cate (add category) */
// router.post('/them-cate.html', checkAdmin, async (req, res) => {
//     req.checkBody('name', 'Giá trị không được rỗng').notEmpty();
//     req.checkBody('name', 'Name phải có từ 3 đến 32 ký tự').isLength({ min: 3, max: 32 });
    
//     const errors = req.validationErrors();
//     if (errors) {
//         return res.render('admin/cate/them', { errors: errors });
//     }

//     const cate = new Cate({
//         name: req.body.name,
//         nameKhongDau: bodauTiengViet(req.body.name),
//     });

//     try {
//         await cate.save();  // Use async/await for save operation
//         req.flash('success_msg', 'Đã Thêm Thành Công');
//         res.redirect('/admin/cate/them-cate.html');
//     } catch (err) {
//         res.status(500).send('Error occurred: ' + err.message);
//     }
// });

// /* GET sua cate (edit category) form */
// router.get('/:id/sua-cate.html', checkAdmin, async (req, res) => {
//     try {
//         const data = await Cate.findById(req.params.id);  // Use async/await for findById
//         res.render('admin/cate/sua', { errors: null, data: data });
//     } catch (err) {
//         res.status(500).send('Error occurred: ' + err.message);
//     }
// });

// /* POST sua cate (edit category) */
// router.post('/:id/sua-cate.html', checkAdmin, async (req, res) => {
//     req.checkBody('name', 'Giá trị không được rỗng').notEmpty();
//     req.checkBody('name', 'Name phải có từ 3 đến 32 ký tự').isLength({ min: 3, max: 32 });

//     const errors = req.validationErrors();
//     if (errors) {
//         try {
//             const data = await Cate.findById(req.params.id);  // Use async/await for findById
//             return res.render('admin/cate/sua', { errors: errors, data: data });
//         } catch (err) {
//             res.status(500).send('Error occurred: ' + err.message);
//         }
//     }

//     try {
//         const data = await Cate.findById(req.params.id);  // Use async/await for findById
//         data.name = req.body.name;
//         data.nameKhongDau = bodauTiengViet(req.body.name);
//         await data.save();  // Use async/await for save operation
//         req.flash('success_msg', 'Đã Sửa Thành Công');
//         res.redirect(`/admin/cate/${req.params.id}/sua-cate.html`);
//     } catch (err) {
//         res.status(500).send('Error occurred: ' + err.message);
//     }
// });

// /* GET xoa cate (delete category) */
// router.get('/:id/xoa-cate.html', checkAdmin, async (req, res) => {
//     try {
//         await Cate.findByIdAndRemove(req.params.id);  // Use async/await for delete operation
//         req.flash('success_msg', 'Đã Xoá Thành Công');
//         res.redirect('/admin/cate/danh-sach.html');
//     } catch (err) {
//         res.status(500).send('Error occurred: ' + err.message);
//     }
// });

// /* Middleware to check if the user is an admin */
// function checkAdmin(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     } else {
//         res.redirect('/admin/dang-nhap.html');
//     }
// }

// module.exports = router;
