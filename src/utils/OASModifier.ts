import * as fs from 'fs';
import * as dns from 'dns';
import * as Path from 'path';
const glob = require('glob-promise');

interface OASServer{
  url: string
  description?: string
  'x-tags'?: string[]
}

export abstract class OASModifier{

  static async selectServer() {
    const filterTags = process.env.SERVER_FILTER_TAGS != null && process.env.SERVER_FILTER_TAGS.length > 0 ? process.env.SERVER_FILTER_TAGS.split(',') : [];
    const files = await glob('integrated_services/sources/*.json');
    const processes: Promise<void>[] = [];
    files.forEach((fileLoc: string) => {
      processes.push(this.selectServerInner(fileLoc, filterTags));
    })
    return Promise.all(processes)
  }

  static async selectServerInner(fileLoc: string, filters: string[]){
    const fileContent = await fs.promises.readFile(fileLoc, 'utf-8');
    const content = JSON.parse(fileContent);

    const servers: OASServer[] = await this.getServers(filters, content);
    if (servers?.length <= 0){
      console.log('[%s] There are no server candidates, Im not modifying the OAS file...', fileLoc);
      return;
    }
    const serverElected = await this.getBestServer(servers, fileLoc);

    return this.writeServerToFile(serverElected, fileLoc, content);
  }

  /**
   * Modifies OAS servers specification
   * @param filters
   * @param content
   */
  private static async getServers(filters: string[], content: { servers: OASServer[] | null; }): Promise<OASServer[]>{
    let res: OASServer[] = [];
    if (content.servers != null){
      res = content.servers.filter((server: OASServer) => {
        if (filters?.length > 0){ //Filter servers by tag
          return server['x-tags']?.some((aux) => filters.includes(aux));
        }else{ //Select servers without any tag
          return server['x-tags'] == null || server['x-tags']?.length === 0;
        }
      });
    }
    return res;
  }

  /**
   * Modifies OAS servers specification
   * @param servers
   * @param {string} loc location (integrated_services/x.json)
   */
  private static async getBestServer(servers: OASServer[], loc: string): Promise<OASServer>{

    if ((process.env.DISABLE_SERVER_OPTIMIZER != null && process.env.DISABLE_SERVER_OPTIMIZER === 'true')
          || process.env.PUBLIC_URI == null){
        console.log("[%s] Public URI is not set or Optimizer is disabled -> Skip server optimization get the first one", loc);
        return servers[0];
    }

    if (servers.length === 1){ //only one server candidate, just return this one
      console.log("[%s] There is only one server candidate -> %s", loc, servers[0].url);
      return servers[0];
    }

    const hostIP = (await dns.promises.lookup(new URL(process.env.PUBLIC_URI).hostname)).address;
    const availableServers = [];

    for(const server of servers) {
      let aux;
      try {
        aux = await dns.promises.lookup(new URL(server.url).hostname);
      }catch (error){
        continue;
      }
      availableServers.push(server);
      if (aux.address === hostIP){ //Override servers pointing to localhost / use local server
        console.log("[%s] DNS resolution passed | select best server : %s", loc, server.url);
        return server;
      }
    }
    let res;
    //At this point, set the first server
    if (availableServers.length > 0){
      res = availableServers[0];
      console.log("[%s] Optimal server not found, get the first one available -> %s", loc, res.url);
    }else{
      res = servers[0];
      console.log("[%s] No server passed the DNS resolution, set the first one -> %s", loc, res.url);
    }

    return res;
  }

  private static writeServerToFile(server: OASServer, fileLoc: string, content: { servers: OASServer[] | null; }){
    content.servers = [server];
    const baseName = Path.basename(fileLoc);
    return fs.promises.writeFile(`integrated_services/${baseName}`, JSON.stringify(content));
  }

}