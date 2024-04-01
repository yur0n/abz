"use client"

import { useForm } from "react-hook-form"
import axios from "axios";
const apiUrl = process.env.NEXT_PUBLIC_API_URI;

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface formSchema {
	name: string;
	email: string;
	phone: string;
	position_id: string;
	photo: string;
}

export function ProfileForm({ handleNewUser, loadUsers, getToken }: 
  { handleNewUser: (resJson: any) => void, loadUsers: () => void, getToken: () => void}) {

  const form = useForm<formSchema>({
    defaultValues: {
      name: '',
			email: '',
			phone: '',
			position_id: '',
      photo: '',
    },
  })
 
  async function onSubmit(values: formSchema) {
    const formData = new FormData();
    for (const key in values) {
      if (key in values) {
        formData.append(key, values[key as keyof typeof values]);
      }
    }
    
    const fileInput: any = document.querySelector('input[type="file"]');
    if (fileInput.files.length) {
      formData.append('photo', fileInput.files[0]);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(apiUrl + '/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Token': token,
        },
      });
      handleNewUser(response.data);
    } catch (error: any) {
      console.error(error);
      handleNewUser(error.response?.data);
      
    }
    form.reset();
  }

	return (

    <Form {...form}  >
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-gray-100 rounded-md border-2 border-black w-[400px]">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="p-2">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Jhon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="p-2">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="jhon@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="p-2">
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+380955388485" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position_id"
          render={({ field }) => (
            <FormItem className="p-2">
              <FormLabel>Position_id</FormLabel>
              <FormControl>
                <Input placeholder="5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem className="p-2">
              <FormLabel>Photo</FormLabel>
              <FormControl>
                <Input type='file' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="block mx-auto w-48" type="submit" >Create User</Button>
        <div className="flex justify-center space-x-20 p-2">
          <Button title="Load first 18 users" type="button" onClick={() => loadUsers()}>Load Users</Button>
          <Button type="button" onClick={() => getToken()}>Get Token</Button>
        </div>
      </form>
      
    </Form>
  )
}