import prisma from '../db/prisma.js';
import { query, validationResult } from 'express-validator';
import { ValidationError } from './errorHandler.js';

const HOST = process.env.HOST || 'http://localhost:80';

function validateQuery(req, res, next) {
	const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const fails = {};
			errors.array().forEach((error) => {
				const { path, msg } = error;
				if (!fails[path]) {
					fails[path] = [];
				}
				fails[path].push(msg);
			});
			return next(new ValidationError(fails));
		}
		next();
}

async function getAndSendUsers(req, res, next) {
	const count = Number(req.query.count) || 1,
				offset = Number(req.query.offset) || 0,
				page = Number(req.query.page) || 1;
	try {
		const totalCount = await prisma.user.count();
		const totalPages = Math.ceil(totalCount / count);
	
		let users, nextPage, prevPage;
		if (offset) {
			users = await prisma.user.findMany({
				take: count,
				skip: offset,
				orderBy: { registration_timestamp: 'desc' },
			});
			nextPage = Math.floor(offset / count + 2);
			prevPage = Math.floor(offset / count);
		} else {
			if (page > totalPages) {
				return res.status(404).json({
					success: false,
					message: 'Page not found.',
				});
			}
			users = await prisma.user.findMany({
				take: count,
				skip: count * (page - 1),
				orderBy: { registration_timestamp: 'desc' },
			});
			nextPage = page + 1;
			prevPage = page - 1;
			
		}
	
		const nextLink = nextPage <= totalPages ? `${HOST}/users?page=${nextPage}&count=${count}` : null;
		const prevLink = prevPage > 0 ? `${HOST}/users?page=${prevPage}&count=${count}` : null;
	
		res.status(200).json({
				success: true,
				page: offset ? Math.floor(offset / count + 1) : page,
				total_pages: totalPages,
				total_users: totalCount,
				count: users.length,
				links: {
						next_url: nextLink,
						prev_url: prevLink,
				},
				users,
		});
	} catch (e) {
		next(e);
	}
}

export const getUsers = [
	query('count').optional().isInt().withMessage('The count must be an integer.').bail()
		.isInt({ min: 1 }).withMessage('The count must be at least 1.'),
	query('offset').optional().isInt().withMessage('The offset must be an integer.').bail()
		.isInt({ min: 0 }).withMessage('The offset must be at least 0.'),
	query('page').optional().custom((value, { req }) => {
		if (req.query.offset === undefined) {
			if (!Number.isInteger(Number(value)) || !value ) {
				throw new Error('The page must be an integer.');
			} else if (Number(value) < 1) {
				throw new Error('The page must be at least 1.');
			}
		}
		return true;
	}),
	validateQuery,
	getAndSendUsers
]

export const getUser = async (req, res, next) => {
	const id = parseInt(req.params.id);
	if (!id) {
		return next(new ValidationError({ user_id: 'The user_id must be an integer.' }, 400));
	}
	try {
		const user = await prisma.user.findFirst({ where: { id } });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'The user with the requested identifier does not exist',
				fails: { user_id : [ 'User not found' ]}
			});
		}
		res.status(200).json({
			success: true,
			user,
		});
	} catch (e) {
		next(e);
	}
}