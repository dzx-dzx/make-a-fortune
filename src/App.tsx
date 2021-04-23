import { Box, Flex, useColorModeValue, useQuery } from "@chakra-ui/react"
import axios from "axios"
import React, { Fragment, useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Switch, useParams, useLocation } from "react-router-dom"
import PhoneNavbar from "~src/components/elements/PhoneNavbar"
import { useClient } from "./client"
import Navbar from "./components/elements/Navbar"
import {
  PostListCategory,
  PostListHistory,
  PostListMy,
  PostListNotification,
  PostListSearch,
  PostListStar,
  PostListTime,
  PostListTrend,
} from "./components/lists/PostList"
import ThreadList from "./components/lists/ThreadList"
import ScrollToTop from "./components/utils/ScrollToTop"
import Login from "./components/views/Login"
import Settings from "./components/views/Settings"

import { Client, RPCVersion } from "~/src/client"
import { useTokenState } from "./settings"

function OAuthCallback() {

  let accessCode = new URLSearchParams(useLocation().search).get("code");
  let [token, setToken] = useTokenState("")
  let client = useClient()
  useEffect(() => {
    axios.post("https://sjtu.closed.social/oauth/token",
      `client_id=g15W6Gy7rY6dfXDcMnRHd7u03MEtpeCso8wUivhOa9Y&client_secret=EfGVKKJDTrSrmYzxZkKlnzDjzUwl_E58NtBDiKf13qM&redirect_uri=http://127.0.0.1:1234/callback&grant_type=authorization_code&code=${accessCode}`
    ).then(res => {
      setToken(res.data.access_token as unknown as string)

    })
      .catch((err: any) => { console.log(err) })
  }, [])

  return (<div>Token:{token}<br />
    accessCode:{accessCode}</div>)
}
function App() {
  const navBgColor = useColorModeValue("gray.50", "gray.900")
  const phoneNavbarBgColor = useColorModeValue("white", "gray.800")

  return (
    <Router>
      <Fragment>
        <ScrollToTop />
        <Box
          display={{ base: "unset", md: "none" }}
          position="fixed"
          top="0"
          backgroundColor={phoneNavbarBgColor}
          shadow="sm"
          width="100%"
          zIndex="1000"
        >
          <Box padding="4">
            <PhoneNavbar />
          </Box>
        </Box>
        <Box
          size="300px"
          display={{ base: "none", md: "unset" }}
          position="fixed"
          top={0}
          bottom={0}
          bg={navBgColor}
          overflowY={{ base: "unset", md: "scroll" }}
          overflowX="hidden"
        >
          <Box padding="4" width="300px">
            <Navbar />
          </Box>
        </Box>
        <Flex
          mt={{
            base: "5rem",
            md: "0",
          }}
        >
          <Box
            size="300px"
            display={{ base: "none", md: "unset" }}
            bg={navBgColor}
            overflowY={{ base: "unset", md: "scroll" }}
            overflowX="hidden"
            height="100%"
          >
            <Box width="300px"></Box>
          </Box>
          <Box flex="1">
            <Switch>
              <Route path="/login">
                <Login />
              </Route>
              <Route path="/settings">
                <Settings />
              </Route>
              <Route exact path="/">
                <PostListTime />
              </Route>
              <Route path="/category/:categoryId">
                <PostListCategory />
              </Route>
              <Route path="/posts/trend">
                <PostListTrend />
              </Route>
              <Route path="/posts/star">
                <PostListStar />
              </Route>
              <Route path="/posts/me">
                <PostListMy />
              </Route>
              <Route path="/posts/notification">
                <PostListNotification />
              </Route>
              <Route path="/posts/search">
                <PostListSearch />
              </Route>
              <Route path="/posts/history">
                <PostListHistory />
              </Route>
              <Route path="/posts/:postId">
                <ThreadList />
              </Route>
              <Route path="/callback">
                <OAuthCallback />
              </Route>
            </Switch>
          </Box>
        </Flex>
      </Fragment>
    </Router>
  )
}

export default App
