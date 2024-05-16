import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainContentComponent } from './components/main-content/main-content.component';

const gameRoutes: Routes = [
  { path: 'dashboard', component: MainContentComponent },
  { path: 'settings', component: MainContentComponent },
  { path: 'journey', component: MainContentComponent },
  { path: 'armory', component: MainContentComponent },
  { path: 'combat', component: MainContentComponent },
  { path: 'trade', component: MainContentComponent },
  { path: 'forum', component: MainContentComponent },
];

const homeRoutes: Routes = [
  { path: '', component: MainContentComponent },
  { path: 'about', component: MainContentComponent },
  { path: 'start', component: MainContentComponent },
  { path: 'story', component: MainContentComponent },
  { path: 'forum', component: MainContentComponent },
  { path: 'credits', component: MainContentComponent },
  { path: 'contact', component: MainContentComponent },
];

export const routes: Routes = [
    ...gameRoutes,
    ...homeRoutes
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
