import prisma from '../db/prisma.js';

export default async (req, res, next) => {
	try {
		const positions = await prisma.position.findMany();
		console.log(positions);
		if (!positions.length) {
			return res.status(422).json({
				success: false,
				message: 'Positions not found',
			});
		}
		return res.status(200).json({
			success: true,
			positions,
		});
	} catch (e) {
		next(e);
	}
}
