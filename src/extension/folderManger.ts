import { configuration } from "./configuration";
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class folderManger {
    private config:any;
    
    constructor() {
        this.config = configuration;
        
        this.initFolder();
    }
    exists(fileName:string) {
    return fs.existsSync(path.join(this.folder(), fileName));
    }
    path(fileName:string) {
        return path.join(this.folder(), fileName);
    }
    folder() {
        let settingsDir = this.config.get('folder', null);
        if (settingsDir && fs.existsSync(settingsDir)) {
            return settingsDir;
        }
        return this.defaultFolder();
    }
    defaultFolder() {
        let userDataDir = null;
        switch (process.platform) {
            case 'linux':
                userDataDir = path.join(os.homedir(), '.config');
                break;
            case 'darwin':
                userDataDir = path.join(os.homedir(), 'Library', 'Application Support');
                break;
            case 'win32':
                userDataDir = process.env.APPDATA;
                break;
            default:
                throw Error("Unrecognizable operative system");
        }
        return path.join(userDataDir ?? '', 'Code', 'User', 'keyBindingsToMd');
    }
    initFolder() {
        let folder = this.folder();
        fs.mkdir(folder, '0755', function (err:any) {
            if (err && err.code != 'EEXIST') {
                throw Error("Failed to created templates directory " + folder);
            }
        });
    }
}
