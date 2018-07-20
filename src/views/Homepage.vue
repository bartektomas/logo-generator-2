<template>
  <div class="container">

    <div class="steps">
      <div :class="stepClassObject(0)" @click="changeStep(0)">
        <i class="el-icon-edit"></i> Select a wordmark
      </div>

      <i class="el-icon-arrow-right"></i>

      <div :class="stepClassObject(1)" @click="changeStep(1)">
        <i class="el-icon-picture"></i> Search for a logomark
      </div>

      <i class="el-icon-arrow-right"></i>

      <div :class="stepClassObject(2)" @click="changeStep(2)">
        <i class="el-icon-upload"></i> Get your logo
      </div>
    </div> <!-- ./steps -->

    <div class="font-list-wrapper" v-if="currentStep == 0" v-loading="isLoadingFonts">

      <div class="font-list-wrapper__input">
        <el-input placeholder="Type your business name" v-model="currentText">
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="getSvgText()">
          </el-button>
        </el-input>
      </div>

      <div class="item-list font-list">
        <el-card
          v-for="font in fontList"
          v-bind:key="font.family"
          class="font"
          :class="{ 'is-active': currentFont == font }"
          @click.native="chooseFont(font)">
            <!--
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <path fill="#000" :d="font.svg" />
            </svg>
             -->
            <div v-html="font.svg"></div>
        </el-card>
      </div>
    </div> <!-- /.font-list-wrapper -->

    <div class="icon-list-wrapper" v-if="currentStep == 1" v-loading="isLoadingIcons">
      <div class="icon-list-wrapper__input">
        <el-input placeholder="Search for a logomark" v-model="currentIconSearchTerm">
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="insertIconSearchExample(currentIconSearchTerm)">
          </el-button>
        </el-input>

        <p>
          Examples:
          <span v-for="term in iconSearchExampleList" v-bind:key="term"
            @click="insertIconSearchExample(term)">
              {{term}}
          </span>
        </p>
      </div>

      <div class="item-list icon-list">
        <el-card
          class="icon"
          :class="{ 'is-active': currentIcon == icon }"
          v-for="icon in iconList"
          v-bind:key="icon.url"
          @click.native="chooseIcon(icon)">
            <img :src="icon.url" width="250" height="150" />
        </el-card>
      </div>
    </div> <!-- /.icon-list-wrapper -->

    <div class="final-logos" v-if="currentStep == 2" v-loading="isLoadingCreatingSvg">
      <div class="final-logos__big-logos">
        <el-card v-html="verticalLogoSvg"></el-card>
        <el-card v-html="horizontalLogoSvg"></el-card>
      </div>

      <div class="final-logos__icons">
        <div v-html="logoIconSquareSvg"></div>
        <div v-html="logoIconRoundedSquareSvg"></div>
        <div v-html="logoIconCircleSvg"></div>
      </div>
    </div>

  </div>
</template>

<script>

import TextToSVG from 'text-to-svg';
import axios from 'axios';
import Vue from 'vue';
import { Button, Card, Loading, Steps, Step, Input } from 'element-ui';

// @ is an alias to /src
import generateSvg from '@/utils/generateSvg';

Vue.use(Loading.directive);

const GOOGLE_API_KEY = 'AIzaSyDK4KTHGKrmyrRGuf3LboVURLmPO53V-WM';

export default {
  name: 'Homepage',
  components: {
    'el-button': Button,
    'el-card': Card,
    'el-steps': Steps,
    'el-step': Step,
    'el-input': Input,
  },
  data() {
    return {
      currentText: '',
      currentStep: 0,
      currentFont: null,
      currentIcon: null,
      verticalLogoSvg: '',
      horizontalLogoSvg: '',
      logoIconSquareSvg: '',
      logoIconRoundedSquareSvg: '',
      logoIconCircleSvg: '',

      fontList: [],
      isLoadingFonts: false,

      currentIconSearchTerm: '',
      iconList: [],
      isLoadingIcons: false,
      iconSearchExampleList: ['shop', 'cloud', 'fashion'],

      isLoadingCreatingSvg: false,
      stepList: [
        'Select a wordmark',
        'Search for a logomark',
        'Get your logo',
      ],
    };
  },
  methods: {
    changeStep(newStep) {
      if (this.currentStep > newStep) {
        this.verticalLogoSvg = '';
        this.horizontalLogoSvg = '';
        this.logoIconSquareSvg = '';
        this.logoIconRoundedSquareSvg = '';
        this.logoIconCircleSvg = '';
        this.currentStep = newStep;
      }
    },
    getSvgText() {
      this.isLoadingFonts = true;
      this.fontList = [];

      let fontSize = 90;
      if (this.currentText.length > 5) {
        fontSize = 90 - (this.currentText.length * 3);
      }

      const textOptions = { x: 0, y: 0, fontSize, anchor: 'top', attributes: {} };

      let googleFontApiUrl = `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_API_KEY}`;
      googleFontApiUrl += '&sort=trending';

      axios.get(googleFontApiUrl, { responseType: 'json' })
        .then((response) => {
          this.isLoadingFonts = false;
          const fontList = response.data;

          fontList.items.slice(0, 50).forEach((fontObject, index) => {
            const fontDefaultVariant = fontObject.variants[0];
            const fontUrl = fontObject.files[fontDefaultVariant].replace('http', 'https');

            TextToSVG.load(fontUrl, (err, textToSVG) => {
              let svg;
              try {
                svg = textToSVG.getSVG(this.currentText, textOptions);
              } catch (e) {
                console.log('ERROR', index);
                return;
              }

              const newFont = {
                url: fontUrl,
                svg,
                family: fontObject.family,
              };
              this.fontList.push(newFont);
            }); // TextToSVG.load
          }); // forEach
        })
        .catch((error) => {
          console.log('ERROR');
          console.log(error);
        });
    }, // getSvgText()
    chooseFont(font) {
      this.currentFont = font;
      this.currentStep = 1;
    },
    insertIconSearchExample(term) {
      this.currentIconSearchTerm = term;
      this.loadIcons();
    },
    loadIcons() {
      this.isLoadingIcons = true;
      this.iconList = [];

      axios.get(`/micro-api/icons/${this.currentIconSearchTerm}`, { responseType: 'json' })
        .then((response) => {
          response.data.icons.forEach((iconObject) => {
            const newIcon = {
              url: iconObject.icon_url,
              id: iconObject.id,
              term_id: iconObject.term_id,
            };
            this.iconList.push(newIcon);
          });

          this.isLoadingIcons = false;
        })
        .catch((error) => {
          console.log('ERROR');
          console.log(error);
          this.isLoadingIcons = false;
        });
    }, // loadIcons
    chooseIcon(icon) {
      this.currentIcon = icon;
      this.currentStep = 2;
      this.createSvg();
    },
    stepClassObject(step) {
      return {
        'is-process': this.currentStep === step,
        'is-finish': this.currentStep > step,
      };
    },
    createSvg() {
      this.isLoadingCreatingSvg = true;

      generateSvg('all', this.currentIcon.url, this.currentFont.url, this.currentText)
        .then((svg) => {
          this.isLoadingCreatingSvg = false;
          this.verticalLogoSvg = svg.verticalLogoSvg;
          this.horizontalLogoSvg = svg.horizontalLogoSvg;

          this.logoIconSquareSvg = svg.logoIconSquareSvg;
          this.logoIconRoundedSquareSvg = svg.logoIconRoundedSquareSvg;
          this.logoIconCircleSvg = svg.logoIconCircleSvg;
        })
        .catch((error) => {
          console.log('generateSvg ERROR');
          console.log(error);
        });
    },

  }, // methods
  mounted() {
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.container{
  max-width: 1000px;
  margin: auto;
  margin-top: 50px;
}

.steps{
  /* background: #f5f7fa; */ /* hsl(216, 33%, 97%) */
  background: hsl(216, 33%, 95%);

  padding: 13px 8%;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  max-width: 700px;
  margin: auto;
  font-size: 16px;
  line-height: 20px;

  margin-top: 50px;
}

.steps > div{
  color: #c0c4cc; /* hsl(220, 11%, 78%) */
  position: relative;
}

.steps > div.is-finish:hover{
  cursor: pointer;
  color: #94989e;
}

.steps > i.el-icon-arrow-right{
  font-size: 20px;
  color: hsla(220, 11%, 65%, 1);
}

.steps > div i{
  margin-right: 5px;
}

.steps > div.is-process{
  font-weight: 700;
  color: #303133;
}

.steps > div.is-finish{
  /* color: #c0c4cc; */
}

/* .font-list, .icon-list{ */
.item-list{
  display: flex;
  flex-wrap: wrap;
  /* justify-content: space-between; */
  justify-content: space-evenly;
  margin-top: 50px;
}

.item-list > div:hover{
  cursor: pointer;
  background-color: #eee;
}

.item-list > div.is-active{
  background-color: #eee;
}

.font-list-wrapper .font-list-wrapper__input{
  max-width: 300px;
  margin: auto;
  display: block;
  margin-top: 60px;
}

.font-list .font{
  width: 450px;
}

.font-list .font .el-card__body{
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-list .font svg{
  margin: auto;
  display: block;
}

.icon-list-wrapper{
  margin-top: 100px;
}

.icon-list-wrapper__input{
  max-width: 300px;
  margin: auto;
  display: block;
}

.icon-list-wrapper__input > p{
  font-size: 14px;
  color: rgba(0, 0, 0, 0.7);
}

.icon-list-wrapper__input > p span{
  border-bottom: 1px rgba(0, 0, 0, 0.7) dashed;
  margin: 0 8px;
}

.icon-list-wrapper__input > p span:hover{
  cursor: pointer;
}

.final-logos{
  margin-top: 50px;
}

.final-logos__big-logos{
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
}

.final-logos__big-logos > div{
  padding: 0;
  max-height: 300px;
}

.final-logos__icons{
  background: #000;
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-top: 30px;
  padding: 20px;
}

</style>
