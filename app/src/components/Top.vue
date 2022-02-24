<template>
  <div class="container">
    <h1>Spotify</h1>
    <div class="row">
      <button @click="spotifyLogin" class="button b-small">認証</button>
      <button @click="getPlaylist" class="button b-small">取得</button>
      <chart
      v-if="loaded"
      :chartData="chartItems" :options="options"/>
      <ul v-for="data in Playlist" :key="data.id">
        <li @click="getItems(data.id)">{{ data.name }}</li>
      </ul>
      <ul v-for="data in Feature" :key="data.id">
        <li>{{ data }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import chart from './Chart';

export default {
  components: {
    chart,
  },
  data: function() {
    return {
      Playlist:null,
      Items:null,
      idList:null,
      Feature:null, 
      height:100, 
      width: 10, 

      loaded: false,
      chartdata: null,  
      chartItems: null,
      options: {
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: '曲順'
            }
          }],
          yAxes: [
          {
            id: "features",
            position: "left",
            ticks: {
              min: 0, // 最小値
              max: 1, // 最大値
              beginAtZero: true,
              stepSize: 0.1
            }
          },
          /*
          {
            id: "energy",
            position: "right",
            gridLines: { // 補助線
              drawBorder: false,
              display: false
            },
            scaleLabel:{
              display: false,
            },
            ticks: {
              min: 0, // 最小値
              max: 1, // 最大値
              beginAtZero: true,
              stepSize: 0.1,
            }
          }*/
          ]
        }, 
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },
  props: {
    routeParams: Object
  },
  created: function() {
    if (this.$route.hash) {
      this.$router.push(this.$route.fullPath.replace('#', '?'))
    }
  },
  computed:{
    myStyles(){
      return{
        height: `${this.height}px`,
        width: `${this.width}px`,
        position:'relative'
      }
    }
  }, 
  methods: {
    spotifyLogin: function() {
      let endpoint = 'https://accounts.spotify.com/authorize'
      let response_type = 'token'
      let client_id = '6c5f168e00e04a219e70682109e83f0c'
      // let redirect_uri = 'http://0.0.0.0:9000'
      let redirect_uri = 'http://0.0.0.0:9000'
      let scope = 'playlist-read-private'
      location.href = endpoint +
        '?response_type=' + response_type +
        '&client_id=' + client_id +
        '&redirect_uri=' + redirect_uri +
        '&scope=' + scope
    },
    getPlaylist: function() {
      let vm = this
      let endpoint = 'https://api.spotify.com/v1/me/playlists'
      let data = {
        headers: {
          'Authorization': this.routeParams.token_type + ' ' + this.routeParams.access_token
        },
        data: {}
      }
      axios
      .get(endpoint, data)
      .then(res => {
        vm.Playlist = res.data.items
      })
      .catch(err => {
        console.error(err)
      })
    },
    getFeature: function(id_list){
      let vm = this
      let ids = id_list.join(",");
      let endpoint = 'https://api.spotify.com/v1/audio-features?ids=' + ids;
      let data = {
        headers: {
          'Authorization': this.routeParams.token_type + ' ' + this.routeParams.access_token
        },
        data: {}
      }
      axios
      .get(endpoint, data)
      .then(res => {
        vm.Feature = res.data.audio_features;
        const danceability_list = vm.Feature.map(item => item.danceability);
        const energy_list = vm.Feature.map(item => item.energy);
        const loudness_list = vm.Feature.map(item => item.loudness);
        const speechiness_list = vm.Feature.map(item => item.speechiness);
        const acousticness_list = vm.Feature.map(item => item.acousticness);

        console.log(danceability_list);
        console.log(loudness_list);

        vm.chartItems = {
          labels: [...Array(danceability_list.length)].map((_, i) => i),
          datasets: [
          {
            label: "danceability",
            data: danceability_list,
            backgroundColor: 'lightblue',
            yAxisID: 'features'
          },
          {
            label: "energy",
            data: energy_list,
            backgroundColor: '#f87000',
            yAxisID: 'features'
          },
          {
            label: "loudness",
            data: loudness_list,
            backgroundColor: '#f08080',
            yAxisID: 'features'
          },

          ]
        },
        console.log("####");
        vm.loaded = true;
      })
      .catch(err => {
        console.error(err)
      })
    }, 
    getItems: function(playlist_id){
      let vm = this
      let endpoint = 'https://api.spotify.com/v1/playlists/'+ playlist_id + '/tracks'
      let data = {
        headers: {
          'Authorization': this.routeParams.token_type + ' ' + this.routeParams.access_token
        },
        data: {}
      }
      axios
      .get(endpoint, data)
      .then(res => {
        vm.Items = res.data.items
        const track_id_list = vm.Items.map(item => item.track.id);
        vm.idList = track_id_list;
        this.getFeature(vm.idList);
      })
      .catch(err => {
        console.error(err)
      })
    }
  }
}
</script>

<style coped>
/*
.button {
  border: none; 
  background-color: rgb(228, 228, 228);
  border-radius: 30px;
}
*/

.button {
  width: 140px;
  height: 45px;
  font-family: 'Roboto', sans-serif;
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
  background-color: #1DB954;
  box-shadow: 0px 15px 20px rgba(46, 229, 157, 0.4);
  color: #fff;
  transform: translateY(-2px);
}

.b-small{
  width: 100px;
  height: 40px;
  margin: 10px;
}

.b-middle{
  width: 60px;
  height: 40px;
}

.circle {
    margin:0 auto;
    width: 140px;
    height: 140px; 
    background-color: #a5a5a5;
    border-radius: 50%;/* ←円を作る */
    line-height: 140px;
    color: rgb(255, 255, 255);
}

.row{
  margin: 0 auto;
  padding: 30px 20px;
}
</style>

