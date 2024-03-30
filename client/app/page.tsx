'use client';

import axios from "axios";
console.log(process.env.NEXT_PUBLIC_API_URL);
import Pagination from "@/components/pagination";
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProfileForm } from "@/components/form"
import { Button } from "@/components/ui/button"

import { useState } from "react";

import UserCard, { TUserCard } from "@/components/UserCard"

import React from "react";

export default function Home() {
  const [visibleCount, setVisibleCount] = useState(6);
  const [state, setState] = useState({ 
    response: {
      success: false,
      message: '',
      users: [],
      links: { next_url: '', prev_url: ''},
      fails: {},
      page: 1,
      total_pages: 0,
      total_users: 0,
      count: 1,
    }, 
    text: {'Server response': 'data will appear here'} 
  });

  function handleNewUser(resJson: any) {
      setState(prevState => ({ ...prevState, text: resJson }));
  }
  async function getUsers (url: string = 'http://yuron.xyz:2052/users?count=18&page=1') {
    setVisibleCount(6);
    axios.get(url).then(res => res.data)
    .then((res: any) => {
      setState({ response: res, text: res });
    })
    .catch((error) => {
      setState(prevState => ({ ...prevState, text: error.response.data }));
      console.error(error)
    })
  }

  async function handlePagination(goTo: number) {
    const url = goTo ? state.response.links.next_url : state.response.links.prev_url;
    if (!url) return;
    getUsers(url)
  }

  async function getToken() {
    axios.get('http://yuron.xyz:2052/token').then(res => res.data)
    .then((res: any) => {
      localStorage.setItem('token', res.token);
      setState(prevState => ({ ...prevState, text: res }));
    })
    .catch((error) => {
      console.error(error)
      setState(prevState => ({ ...prevState, text: error.response.data }));
    })
  }

  return (
    <main className="mx-2 space-y-2 p-2">
      <div className="flex justify-center space-x-[100px]">
        <ProfileForm handleNewUser={handleNewUser} loadUsers={getUsers} getToken={getToken}/>
        <ScrollArea className="h-[540px] w-[800px] rounded-md p-4 border-2 border-black bg-gray-100">
          <pre>{JSON.stringify(state.text, null, 2)}</pre>
        </ScrollArea>
      </div>
      <div className="flex flex-wrap">
        {state.response.users.slice(0, visibleCount).map((user: TUserCard) => {
          return <UserCard key={user.id} {...user} />
        })}
      </div>
      
      <div className="flex justify-center">
        <Button onClick={() => setVisibleCount(visibleCount + 6)}>Show more</Button>
      </div>
      <Pagination page={state.response.page} handlePagination={handlePagination}/>
    </main>
  );
}
