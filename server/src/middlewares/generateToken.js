import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';
import { TokenError } from './errorHandler.js';

const secret = process.env.JWT_SECRET_KEY || 'JWT_secret_key';

export default async (req, res, next) => {
	try {
		const token = jwt.sign({ timestamp: Date.now() }, secret, { expiresIn: '40m' });
		await prisma.token.create({
			data: {
				token: token,
				expiration: BigInt(Date.now() + 40 * 60 * 1000)
			}
		});
		res.status(200).json({ success: true, token });
	} catch (e) {
		console.error(e);
		next(new TokenError('Token generation failed', 500));
	}
}

setInterval(async () => {
	try {
		await prisma.token.deleteMany({
			where: {
				expiration: {
					lt: BigInt(Date.now())
				}
			}
		});
	} catch (e) {
		console.error(e);
	}
}, 60 * 60 * 1000);