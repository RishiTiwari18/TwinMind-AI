const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

const uploadDirectory = path.resolve(
  __dirname,
  "../../uploads/documents"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedTypes = {
  ".pdf": ["application/pdf"],
  ".txt": ["text/plain"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadDirectory);
  },

  filename: function (req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();

    callback(null, `${randomUUID()}${extension}`);
  },
});

function fileFilter(req, file, callback) {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = allowedTypes[extension];

  if (
    !allowedMimeTypes ||
    !allowedMimeTypes.includes(file.mimetype)
  ) {
    return callback(
      new Error("Only PDF, TXT, and DOCX files are allowed")
    );
  }

  callback(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;