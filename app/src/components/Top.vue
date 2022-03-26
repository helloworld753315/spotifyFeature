<template>
  <div class="container">
    <div class="row top">
      <h1>Spotify Feature</h1>
      <div class="button-container">
        <button @click="spotifyLogin" class="button b-small">連携</button>
        <button @click="getPlaylist" class="button b-small">取得</button>
      </div>
    </div>
    <div class="row">
      <div class="radio-container">
        <div class="radio-button" v-for="(label,index) in keys" :key="index">
          <input type="radio" name="label" v-bind:id="label" @click="selectLabel(index)">
          <label v-bind:id="label">{{label}}</label>
        </div>
      </div>
      <chart v-if="loaded" :chartData="chartItem" :options="options" />
      <ul v-for="data in Playlist" :key="data.id" class="playlist-data">
        <li @click="getItems(data.id)">{{ data.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import chart from "./Chart";

export default {
  components: {
    chart
  },
  data: function() {
    return {
      Playlist: null,
      Items: null,
      idList: null,
      Feature: null,
      featuresList: [], // 特徴量を各データごとに分けてまとめたリスト
      height: 100,
      width: 10,

      loaded: false,
      chartdata: null,
      chartItem: null,
      options: {
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "曲順"
              }
            }
          ],
          yAxes: [
            {
              id: "features",
              position: "left",
              ticks: {
                beginAtZero: true
              }
            }
          ]
        },
        responsive: true,
        maintainAspectRatio: false
      },
      keys: null
    };
  },
  props: {
    routeParams: Object
  },
  created: function() {
    if (this.$route.hash) {
      this.$router.push(this.$route.fullPath.replace("#", "?"));
    }
  },
  computed: {
    myStyles() {
      return {
        height: `${this.height}px`,
        width: `${this.width}px`,
        position: "relative"
      };
    }
  },
  methods: {
    spotifyLogin: function() {
      let endpoint = "https://accounts.spotify.com/authorize";
      let response_type = "token";
      let client_id = process.env.VUE_APP_SPOTIFY_CLIENT_ID;
      // let redirect_uri = "https://spotify-feature.netlify.app";
      let redirect_uri = "http://0.0.0.0:9000";
      let scope = "playlist-read-private";
      location.href =
        endpoint +
        "?response_type=" +
        response_type +
        "&client_id=" +
        client_id +
        "&redirect_uri=" +
        redirect_uri +
        "&scope=" +
        scope;
    },
    getPlaylist: function() {
      let vm = this;
      let endpoint = "https://api.spotify.com/v1/me/playlists";
      let data = {
        headers: {
          Authorization:
            this.routeParams.token_type + " " + this.routeParams.access_token
        },
        data: {}
      };
      axios
        .get(endpoint, data)
        .then(res => {
          vm.Playlist = res.data.items;
        })
        .catch(err => {
          console.error(err);
        });
    },
    getFeature: function(id_list) {
      let vm = this;
      let ids = id_list.join(",");
      let endpoint = "https://api.spotify.com/v1/audio-features?ids=" + ids;
      let data = {
        headers: {
          Authorization:
            this.routeParams.token_type + " " + this.routeParams.access_token
        },
        data: {}
      };
      axios
        .get(endpoint, data)
        .then(res => {
          //vm.Feature = res.data.audio_features;
          vm.Feature = res.data.audio_features;
          const danceability_list = vm.Feature.map(item => item.danceability);
          const features_list = []; // 特徴量を各データごとに分けてまとめたリスト
          // const features_list = vm.Feature.map(item => item.acousticness);
          //const keys = Object.keys(vm.Feature[0]);

          const removals = ['id', 'type', 'uri', 'track_href', 'analysis_url'];
           vm.keys = Object.keys(vm.Feature[0]).filter(function(v){
            return ! removals.includes(v);
          });

          vm.featuresList.splice(0, vm.featuresList.length);

          for (let i = 0; i < vm.keys.length; i++) {
            const key = vm.keys[i];
            const features = vm.Feature.map((item, index) => item[key]);
            vm.featuresList.push(features);
          }

          vm.chartItem = {
            labels: [...Array(vm.Feature.length)].map((_, i) => i),
            datasets: [
              {
                label: vm.keys[0],
                data: vm.featuresList[0],
                backgroundColor: "lightblue",
                yAxisID: "features"
              }]
          },
          vm.loaded = true;
        })
        .catch(err => {
          console.error(err);
        });
    },
    getItems: function(playlist_id) {
      let vm = this;
      let endpoint =
        "https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks";
      let data = {
        headers: {
          Authorization:
            this.routeParams.token_type + " " + this.routeParams.access_token
        }
      };
      axios
        .get(endpoint, data)
        .then(res => {
          vm.Items = res.data.items;
          const track_id_list = vm.Items.map(item => item.track.id);
          vm.idList = track_id_list;
          this.getFeature(vm.idList);
        })
        .catch(err => {
          console.error(err);
        });
    },
    selectLabel: function(index){
        this.chartItem = {
            labels: [...Array(this.Feature.length)].map((_, i) => i),
            datasets: [
              {
                label: this.keys[index],
                data: this.featuresList[index],
                backgroundColor: "lightblue",
                yAxisID: "features"
              }
            ]
        }
    }
  }
};
</script>

<style coped>

.container h1{
  text-align: left;
  margin: 20px 60px;
  font-size: 40px;
}

.button {
  width: 140px;
  height: 45px;
  font-family: "Roboto", sans-serif;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2.5px;
  font-weight: 500;
  color: rgb(255, 255, 255);
  background-color: #191414;
  border: none;
  border-radius: 45px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease 0s;
  cursor: pointer;
  outline: none;
}

.button:hover {
  background-color: #1db954;
  box-shadow: 0px 15px 20px rgba(46, 229, 157, 0.4);
  color: #fff;
  transform: translateY(-2px);
}

.radio-container{
  display: flex;
}

.radio-button{
  display: inline-flex;
  /*display: flex;*/
}

.radio-button label{
  cursor: pointer;
}

.b-small {
  width: 100px;
  height: 40px;
  margin: 10px;
}

.b-middle {
  width: 60px;
  height: 40px;
}

.circle {
  margin: 0 auto;
  width: 140px;
  height: 140px;
  background-color: #a5a5a5;
  border-radius: 50%; /* ←円を作る */
  line-height: 140px;
  color: rgb(255, 255, 255);
}

.row ul{
  list-style: none; padding-left: 0;
}

.top{
  display: flex;
}

.row .button-container{
  margin: auto 40px;
  margin-left: auto;
}

.playlist-data{
  text-align: left;
  margin: 30px 80px;
  font-size: 20px;
}

</style>
