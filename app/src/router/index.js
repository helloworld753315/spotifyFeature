import Vue from "vue";
import Router from "vue-router";
import Top from "@/components/Top";

Vue.use(Router);

const routes = [
  {
    path: "/",
    name: "Top",
    component: Top,
    props: route => {
      return { routeParams: route.query };
    }
  }
];

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
