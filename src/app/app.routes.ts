import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainContentComponent } from './components/main-content/main-content.component';
import { CreateCharacterComponent } from './components/create-character/create-character.component';
import { AttributesPanelComponent } from './components/hero/attributes-panel/attributes-panel.component';
import { ManageBuildingsComponent } from './admin/manage-buildings/manage-buildings.component';

const gameRoutes: Routes = [
  { path: 'dashboard', component: MainContentComponent },
  { path: 'attributes', component: AttributesPanelComponent },
  { path: 'challenges', component: MainContentComponent },
  { path: 'combat', component: MainContentComponent },
  { path: 'armory', component: MainContentComponent },
  { path: 'mansion', component: MainContentComponent},
  { path: 'trade', component: MainContentComponent },
  { path: 'forum', component: MainContentComponent },
];

const homeRoutes: Routes = [
  { path: '', component: MainContentComponent },
  { path: 'about', component: MainContentComponent },
  { path: 'start-journey' , component: CreateCharacterComponent },
  { path: 'story', component: MainContentComponent },
  { path: 'forum', component: MainContentComponent },
  { path: 'credits', component: MainContentComponent },
  { path: 'contact', component: MainContentComponent },
];

const adminRoutes: Routes = [
  {path: 'admin/manage-buildings', component: ManageBuildingsComponent},
]

export const routes: Routes = [
    ...gameRoutes,
    ...homeRoutes,
    ...adminRoutes,
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
