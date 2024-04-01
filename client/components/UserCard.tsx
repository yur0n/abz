import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export type TUserCard = {
	name: string,
	position: string,
	id: number,
	email: string,
	phone: string,
	position_id: number,
	registration_timestamp: number,
	photo: string
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp * 1000));
}

export default function UserCard({
	name, position, id, email, phone, position_id, registration_timestamp, photo
	}: TUserCard) {
	return (
		<Card className=" flex flex-wrap mr-4 mb-4 bg-blue-100">
			<CardHeader className="flex">
				<Avatar className="flex-shrink-0">
					<AvatarImage src={photo} />
					<AvatarFallback>
						<Image src="/initial.jpeg" width={100} alt={'User'} height={100} />
					</AvatarFallback>
				</Avatar>
				<div>
					<CardTitle>{name}</CardTitle>
					<CardDescription>{position}</CardDescription>
				</div>
			</CardHeader>
			<div className="">
				<CardContent>
					ID: {id}
				</CardContent>
				<CardContent className="w-[280px]">
					Email: {email}
				</CardContent>
				<CardContent>
					Phone: {phone}
				</CardContent>
				<CardContent>
					Position ID: {position_id}
				</CardContent>
				<CardContent>
					Registration: {formatDate(registration_timestamp)}
				</CardContent>
			</div>
		</Card>
	)
}