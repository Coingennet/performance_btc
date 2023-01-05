<template>
  <div class="bg-[#16151a] w-full py-6 px-8">
    <div class="grid grid-cols-1 gap-4 mb-4">
      <BTCMonthReturn />
    </div>
    <div class="grid grid-cols-12 gap-4 mb-4">
      <div class="xl:col-span-8 lg:col-span-8 md:col-span-12">
        <BTCQuarterlyReturn @average="(v) => average = v" @min="v => min = v" @max="v => max = v" @q_max="v => q_max = v" @q_min="v => q_min = v"/>
      </div>
      <div class="xl:col-span-4 lg:col-span-4 md:col-span-12">
        <Overview :average="average" :min="min" :max="max" :qMax="q_max" :qMin="q_min"/>
      </div>
    </div>
    <div class="grid grid-cols-1 gap-4 mb-4">
      <TrandingPair />
    </div>
    <div class="grid grid-cols-1 gap-4 mb-4">
      <TotalLiquidition />
    </div>
    <!--
    <div class="grid grid-cols-12 gap-4 mb-4">
      <div class="xl:col-span-9 lg:col-span-8 md:col-span-12">
        <div class="grid grid-cols-3 gap-4 mb-4">
          <Dom
            class="md:col-span-1 sm:col-span-3 sm:mb-4 md:mb-0"
            :price="btc.price"
            :change24h="btc.change24h"
            :api="DOM_API"
            key-field="btcDominance"
            title="BTC.Dom"
          />
          <Dom
            class="md:col-span-1 sm:col-span-3 sm:mb-4 md:mb-0"
            :price="eth.price"
            :change24h="eth.change24h"
            :api="DOM_API"
            key-field="ethDominance"
            title="ETH.Dom"
          />
          <Dom
            class="md:col-span-1 sm:col-span-3 sm:mb-4 md:mb-0"
            :api="DOM_API"
            key-field="stablecoinDominance"
            title="Stablecoin.Dom"
          >
            <template #title>
              <div class="flex flex-col items-center">
                <div>Stablecoin</div>
                <div>Dom</div>
              </div>
            </template>
          </Dom>
        </div>
        <div>
          <DominanceRatio />
        </div>
      </div>
      <div class="xl:col-span-3 lg:col-span-4 md:col-span-12">
        <TopTrending />
      </div>
    </div> -->
  </div>
</template>
<script>
import Overview from "./Overview.vue";
import BTCMonthReturn from "./BTCMonthReturn.vue";
import BTCQuarterlyReturn from "./BTCQuarterlyReturn.vue";
import TrandingPair from "./TrandingPair.vue";
import TotalLiquidition from "./TotalLiquidition.vue";
export default {
  components: {
    // TotalMarketCap,
    // FearGreenIndex,
    // TopTrending,
    // Dom,
    TotalLiquidition,
    TrandingPair,
    Overview,
    BTCQuarterlyReturn,
    BTCMonthReturn,
  },
  name: "dash-board",
  data: () => ({
    average: 0,
    min: {year: 0, value:0},
    max: {year: 0, value:0},
    q_max: {year: 0, value:0},
    q_min: {year: 0, value:0},
  }),
};
</script>
