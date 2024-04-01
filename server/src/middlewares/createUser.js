import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';
import multer from 'multer';
import tinify from 'tinify';
import sharp from 'sharp';
import fsp from 'fs/promises';
import crypto from 'crypto';
import { checkSchema, validationResult} from 'express-validator';
import { ValidationError, TokenError } from './errorHandler.js';

tinify.key = process.env.TINIFY_TOKEN;
const secret = process.env.JWT_SECRET_KEY || 'JWT_secret_key';
const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 80;
const emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;


const checkToken = async (req, res, next) => {
	const token = req.header('Token');
	if (!token) return next(new TokenError('Token is required.'));
	try {
		const tokenInDb = await prisma.token.findUnique({
      where: {
        token
      }
    });
		if (!tokenInDb) {
			return next(new TokenError('The token expired.'));
		}
		jwt.verify(token, secret);
		await prisma.token.deleteMany({
			where: {
				token
			}
		});
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return next(new TokenError('The token expired.'));
		} else if (error instanceof jwt.JsonWebTokenError) {
			return next(new TokenError('Invalid token.'));
		} else {
			return next(e);
		}
	}
	next()
}

const validationSchema = {
	'name': {
			trim: true,
			notEmpty: {
				bail: true,
				errorMessage: 'The name field is required.'
			},
			isLength: {
				options: { min: 2, max: 60 },
				errorMessage: 'The name must be between 2 and 60 characters long.'
			}
	},
	'email': {
			trim: true,
			notEmpty: {
				bail: true,
				errorMessage: 'The email field is required.'
			},
			isLength: {
				options: { min: 2, max: 100 },
				errorMessage: 'The email must be between 2 and 100 characters long.'
			},
			matches: {
				options: emailRegex,
				errorMessage: 'The email must be a valid email address.'
			}
	},
	'phone': {
			trim: true,
			notEmpty: {
				bail: true,
				errorMessage: 'The phone field is required.'
			},
			matches: {
				options: /^[\+]{0,1}380([0-9]{9})$/,
				errorMessage: 'The phone must be a valid phone number.'
			}
	},
	'position_id': {
			trim: true,
			notEmpty: {
				bail: true,
				errorMessage: 'The position id field is required.'
			},
			isInt: {
				errorMessage: 'The position id must be an integer.'
			},
			custom: {
				options: (value) => value >= 1,
				errorMessage: 'The position id must be greater than or equal to 1.'
			}
	}
}

const bodyValidation = async (req, res, next) => {
	const errors = validationResult(req);
	const fails = {};
	const photo = [];
	
	if (!req.file) {
		photo.push('The photo is required.');
	} else {
		try {
			const metadata = await sharp(req.file.buffer).metadata();
			if (metadata.width < 70 || metadata.height < 70) {
				photo.push('Minimum size of photo 70x70px.');
			}
			if (metadata.format !== 'jpeg' && metadata.format !== 'jpg') {
				photo.push('The photo must be a JPEG or JPG file.');
			}
			if (metadata.size > 5 * 1024 * 1024) {
				photo.push('The photo may not be greater than 5 Mbytes.');
			}
		} catch (error) {
			photo.push('The photo must be a valid image.');
		}
	}

	if (photo.length) fails.photo = photo;

	if (!errors.isEmpty()) {
			errors.array().forEach((error) => {
					const { path, msg } = error;
					if (!fails[path]) {
							fails[path] = [];
					}
					fails[path].push(msg);
			});
	}
	if (!errors.isEmpty() || photo.length) {
		return next(new ValidationError(fails));
	}
	next();
}

async function checkAndCreateUser(body, randomPhotoName) {
	const { name, email, phone } = body;
	const position_id = parseInt(body.position_id);
	
	const user = await prisma.user.findFirst({
		where: {
			OR: [
					{ email },
					{ phone }
			]
		}
	});
	if (user) {
		return { error: 'User with this email or phone already exists.' };
	}
	const position = await prisma.position.findFirst({
		where: {
			id: position_id
		}
	});
	if (!position) {
		throw new ValidationError({ position_id: ['The position_id does not exist.'] });
	}
	const newUser = await prisma.user.create({
		data: {
			name,
			email,
			phone,
			position: position.name,
			position_id,
			registration_timestamp: Math.floor(Date.now() / 1000),
			photo: `${HOST}:${PORT}/images/users/${randomPhotoName}`
		}
	});
	return newUser;
}

async function savePhoto(input, randomPhotoName) {
	sharp(input)
		.resize(70, 70, { fit: 'cover' })
		.toBuffer()
		.then(buffer => tinify.fromBuffer(buffer).toBuffer())
		.then(resultData => fsp.writeFile(`./public/images/users/${randomPhotoName}`, resultData))
		.then(() => console.log('Photo saved'))
		.catch(err => { throw err });
}

const createNewUser = async (req, res) => {
	const timestamp = Date.now().toString().slice(5);
	const randomString = crypto.randomBytes(4).toString('hex');
	const randomPhotoName = timestamp + randomString + '.jpeg';
	const user = await checkAndCreateUser(req.body, randomPhotoName);
	if (user.error) {
		return res.status(409).json({ success: false, message: user.error });
	}
	await savePhoto(req.file.buffer, randomPhotoName);
	res.status(200).json({ success: true, user_id: user.id, message: 'New user successfully registered' });
}


export default [
	checkToken,
	multer().single('photo'),
	checkSchema(validationSchema, ['body']),
	bodyValidation,
	createNewUser,
	(error, req, res, next) => {
		if (error instanceof multer.MulterError) {
			return next(new ValidationError({ photo: [error.message] }));
		} else {
				next(error);
		}
	}
]

