import { NgModule, APP_INITIALIZER } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";

import { ConfigurationLoader } from "./configuration-loader.service";

export function loadConfiguration(configService: ConfigurationLoader) {
    return () => configService.loadConfiguration();
}

@NgModule({
    imports: [HttpClientModule],
    declarations: [],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: loadConfiguration,
            deps: [ConfigurationLoader],
            multi: true
        }
    ]
})
export class ConfigurationModule { }
