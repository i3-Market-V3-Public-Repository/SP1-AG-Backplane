import * as fs from 'fs';
import * as dns from 'dns';
const glob = require('glob-promise');

export abstract class OASModifier{

  static async optimizeServers() {
    if (process.env.PUBLIC_URI == null){
      console.log("Public URI is not set -> Skip server optimization")
      return;
    }
    const processes: Promise<void>[] = [];
    const hostIP = (await dns.promises.lookup(new URL(process.env.PUBLIC_URI).hostname)).address;
    const files = await glob('integrated_services/*.json');
    files.forEach((file: string) => {
      processes.push(OASModifier.optimizeServer(hostIP, file))
    })
    return Promise.all(processes)
  }

  /**
   * Modifies OAS servers specification
   * @param {string} loc location (integrated_services/x.json)
   * @param {string} hostIP host ip (127.0.0.1)
   */
  private static async optimizeServer(hostIP: string, loc: string){
    const fileContent = await fs.promises.readFile(loc, 'utf-8'); //sync block initialization thread
    const content = JSON.parse(fileContent);
    if (content.servers == null){ //skip if no server is set or just one
      return;
    }
    for(const server of content.servers) {
      let aux;
      try {
        aux = await dns.promises.lookup(new URL(server.url).hostname)
      }catch (error){
        continue;
      }
      if (aux.address === hostIP){ //Override servers pointing to localhost
        //set priority to current node setting localhost as server hostname
        console.log("Found current-server -> %s  | set server : %s", loc, server.url)
        content.servers = [server];
        //write to file
        await fs.promises.writeFile(loc, JSON.stringify(content));
        break;
      }
    }
  }
}