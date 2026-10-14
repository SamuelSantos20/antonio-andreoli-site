import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { normalizePlace,googleLink,loadGoogleReviews,googleReviewsHandler } from '../server/google-reviews.mjs';
import { isGoogleReviewsData,starFill } from '../src/types/googleReviews.ts';
import { defaultProfessionalConfig } from '../src/config/professional.ts';

// Fictional fixtures used only by this test. They are never imported by the app.
const place={
 displayName:{text:'PERFIL FICTÍCIO DE TESTE'},rating:4.3,userRatingCount:17,
 googleMapsUri:'https://www.google.com/maps?cid=123',
 googleMapsLinks:{reviewsUri:'https://www.google.com/maps?cid=123',writeAReviewUri:'https://search.google.com/local/writereview?placeid=TESTE'},
 reviews:[5,1,4].map((rating,index)=>({
  name:'test-'+index,rating,
  authorAttribution:{displayName:'AUTOR FICTÍCIO '+index,uri:'https://www.google.com/maps/contrib/'+index,photoUri:'https://lh3.googleusercontent.com/test'},
  originalText:{text:'TEXTO FICTÍCIO DE TESTE <script>never execute</script>'},
  googleMapsUri:'https://www.google.com/maps/reviews?test='+index,
  relativePublishTimeDescription:'DATA DE TESTE',
 })),
};
const data=normalizePlace(place);
assert.ok(isGoogleReviewsData(data));
assert.equal(data.ratingCount,17,'Use the total count; never the returned sample length.');
assert.deepEqual(data.reviews.map(review=>review.rating),[5,1,4],'Keep relevance order, including low ratings.');
assert.ok(Math.abs(starFill(4.3,4)-30)<1e-9);
assert.equal(starFill(5,4),100);
assert.equal(starFill(NaN,0),0);
assert.equal(starFill(-1,0),0);
assert.equal(starFill(9,4),100);
assert.equal(googleLink('javascript:alert(1)'),null);
assert.equal(googleLink('https://google.com.attacker.example/'),null);
assert.equal(googleLink('https://evil@google.com/'),null);
assert.equal(googleLink('https://g.page/r/test/review'),'https://g.page/r/test/review');
assert.equal(normalizePlace({...place,userRatingCount:0}).rating,null);
assert.equal(normalizePlace({...place,rating:9}).rating,null);
assert.equal(normalizePlace({...place,reviews:[...place.reviews,...place.reviews]}).reviews.length,5);
assert.equal(normalizePlace({...place,reviews:[{...place.reviews[0],googleMapsUri:'javascript:alert(1)'}]}).reviews.length,0);
assert.equal(isGoogleReviewsData({...data,reviews:[{...data.reviews[0],authorUrl:'javascript:alert(1)'}]}),false);
let calls=0;
const empty=await loadGoogleReviews({},async()=>{calls++;throw new Error();});
assert.equal(empty.state,'not-configured');assert.equal(calls,0);
const loaded=await loadGoogleReviews({GOOGLE_PLACES_API_KEY:'TEST_SECRET_NOT_REAL',GOOGLE_PLACE_ID:'TEST_PLACE'},async(url,options)=>{
 calls++;
 assert.ok(url.startsWith('https://places.googleapis.com/v1/places/TEST_PLACE?'));
 assert.equal(options.headers['X-Goog-Api-Key'],'TEST_SECRET_NOT_REAL');
 assert.ok(options.headers['X-Goog-FieldMask'].includes('userRatingCount'));
 return {ok:true,json:async()=>place};
});
assert.equal(loaded.state,'ready');
assert.ok(!JSON.stringify(loaded).includes('TEST_SECRET_NOT_REAL'));
assert.equal((await loadGoogleReviews({GOOGLE_PLACES_API_KEY:'TEST',GOOGLE_PLACE_ID:'TEST_PLACE'},async()=>({ok:false}))).state,'unavailable');
const response={headers:{},setHeader(name,value){this.headers[name]=value;},end(body){this.body=body;}};
assert.equal(await googleReviewsHandler({url:'/api/google-reviews',method:'GET'},response,{}),true);
assert.equal(response.headers['Cache-Control'],'no-store');
assert.equal(JSON.parse(response.body).state,'not-configured');
assert.equal(await googleReviewsHandler({url:'/other',method:'GET'},response,{}),false);
await googleReviewsHandler({url:'/api/google-reviews',method:'POST'},response,{});
assert.equal(response.statusCode,405);

const server=await createServer({server:{middlewareMode:true,watch:null},appType:'custom'});
try {
 const {GoogleReviewSection}=await server.ssrLoadModule('/src/components/GoogleReviewSection.tsx');
 const config={...defaultProfessionalConfig,googleReviewUrl:'https://g.page/r/test/review'};
 const hidden=renderToStaticMarkup(createElement(GoogleReviewSection,{config:defaultProfessionalConfig}));
 assert.equal(hidden,'','No public Google section before the profile exists.');
 const html=renderToStaticMarkup(createElement(GoogleReviewSection,{config,data}));
 assert.ok(html.includes('4,3'));
 assert.ok(html.includes('17 avaliações no Google'));
 assert.ok(html.includes('role="meter"'));
 assert.ok(html.includes('aria-valuenow="4.3"'));
 assert.ok(html.includes('Google Maps'));
 assert.ok(html.includes('AUTOR FICTÍCIO 1'),'Do not remove low reviews.');
 assert.ok(!html.includes('<script>never execute</script>'),'Text must be escaped.');
 assert.ok(html.includes('Ler esta avaliação no Google'));
 const zero=renderToStaticMarkup(createElement(GoogleReviewSection,{config,data:normalizePlace({...place,userRatingCount:0,reviews:[]})}));
 assert.ok(!zero.includes('role="meter"'));
 assert.ok(zero.includes('Sua experiência pode ser a primeira.'));
 console.log(JSON.stringify({result:'PASS',checked:['fractional stars','real average/count','relevance order','no fake score','source/author attribution','safe URLs','escaped text','API key on server only','no request without config','API no-store','API errors','empty profile']},null,2));
}finally{await server.close();}
