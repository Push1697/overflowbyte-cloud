import { generateArticle01, generateArticle03, generateArticle04, generateArticle05 } from './build-articles-group1.mjs';
import { generateArticle06, generateArticle07, generateArticle08, generateArticle09 } from './build-articles-group2.mjs';
import { generateArticle10, generateArticle11, generateArticle12 } from './build-articles-group3.mjs';

console.log('🚀 Starting generation of animated interactive experiences for all flagship articles...\n');

console.log('--- GROUP 1: Core Linux & Cloud Networking ---');
generateArticle01();
generateArticle03();
generateArticle04();
generateArticle05();

console.log('\n--- GROUP 2: RHCSA/RHCE Certification & Ansible ---');
generateArticle06();
generateArticle07();
generateArticle08();
generateArticle09();

console.log('\n--- GROUP 3: Advanced Automation, Mobility & Storage ---');
generateArticle10();
generateArticle11();
generateArticle12();

console.log('\n✅ All 11 animated HTML experience pages successfully generated and markdown banners injected!');
