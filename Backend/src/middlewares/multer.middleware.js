import multer from "multer";


// const storage=multer.diskStorage({
//     destination:function(req,file,cb){
//         cb(null, "./public/temp")}, // Specify the destination folder for uploaded files    
//         filename: function(_, file, cb) {
//             cb(null,  file.originalname); // Append a unique suffix to the original filename
//         }   

//     }
// )

const storage = multer.memoryStorage();
export const upload = multer({ storage: storage })