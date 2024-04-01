import prisma from "../src/db/prisma.js";
const HOST = process.env.HOST || 'http://localhost:80';

const names = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Daniel', 'Olivia', 'Matthew', 'Sophia', 'James', 'Emma', 'Benjamin', 'Ava', 'William', 'Isabella', 'Alexander', 'Mia', 'Ethan', 'Charlotte', 'Joseph', 'Amelia', 'Henry', 'Harper', 'Samuel', 'Evelyn', 'Nicholas', 'Abigail', 'Anthony', 'Emily', 'Daniel', 'Elizabeth'];
const getRandomName = () => names[Math.floor(Math.random() * names.length)];

const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
const getRandomEmail = () => {
	const name = getRandomName().toLowerCase();
	const domain = domains[Math.floor(Math.random() * domains.length)];
	return `${name}${Math.floor(Math.random() * 100)}@${domain}`;
};


const getRandomPhone = () => {
	const countryCode = '+380';
	const operator = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
	const phoneNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
	return countryCode + operator + phoneNumber;
};

const positions = ['Developer', 'Designer', 'Manager', 'Engineer', 'Analyst', 'Scientist', 'Specialist', 'Consultant', 'Assistant', 'Advisor', 'Representative'];
const getRandomPosition = () => positions[Math.floor(Math.random() * positions.length)];

const getRandomTimestamp = () => {
  const fiveYearsAgo = new Date().getTime() - (5 * 365 * 24 * 60 * 60 * 1000);
  const now = new Date().getTime();
  return Math.floor((Math.random() * (now - fiveYearsAgo) + fiveYearsAgo) / 1000);
};

const users = [];
for (let i = 0; i < 45; i++) {
	const position = getRandomPosition();
	const user = {
		name: getRandomName(),
		email: getRandomEmail(),
		phone: getRandomPhone(),
		position: position,
		position_id: positions.indexOf(position) + 1,
		registration_timestamp: getRandomTimestamp(),
		photo: HOST + '/images/users/initial.jpeg'
	};
	users.push(user);
}

async function seed() {
	for (const user of users) {
		await prisma.user.create({
			data: user
		});
	}
	for (const position of positions) {
		await prisma.position.create({
			data: {
				name: position
			}
		});
	}
	console.log('DB seeded with users and positions!');
}
seed().catch(console.error).finally(async () => process.exit(0));