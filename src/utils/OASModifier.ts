import * as fs from 'fs';
import * as dns from 'dns';
const glob = require('glob-promise');

export abstract class OASModifier{

  static async optimizeServers() {
    const processes: Promise<void>[] = [];
    const hostIP = (await dns.promises.lookup(process.env.HOST as string)).address;
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
    if (content.servers == null || content.servers.length <= 1){ //skip if no server is set or just one
      return;
    }
    for(const server of content.servers) {
      const aux = await dns.promises.lookup(new URL(server.url).hostname)
      if (aux.address === hostIP && content.servers[0] !== server){ //only optimize if matches in a different position than 0
        console.log("Setting servers priority -> %s / to: %s", loc, server.url)
        //set priority to current node move to first position
        const auxArray = content.servers.filter((value: never) => value !== server)
        content.servers = [server, ...auxArray];
        //write to file
        await fs.promises.writeFile(loc, JSON.stringify(content));
        break;
      }
    }
  }
}