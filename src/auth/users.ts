/*
#  Copyright 2020-2022 i3-MARKET Consortium:
#
#  ATHENS UNIVERSITY OF ECONOMICS AND BUSINESS - RESEARCH CENTER
#  ATOS SPAIN SA
#  EUROPEAN DIGITAL SME ALLIANCE
#  GFT ITALIA SRL
#  GUARDTIME OU
#  HOP UBIQUITOUS SL
#  IBM RESEARCH GMBH
#  IDEMIA FRANCE
#  SIEMENS AKTIENGESELLSCHAFT
#  SIEMENS SRL
#  TELESTO TECHNOLOGIES PLIROFORIKIS KAI EPIKOINONION EPE
#  UNIVERSITAT POLITECNICA DE CATALUNYA
#  UNPARALLEL INNOVATION LDA
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#
*/

import {UserProfile} from '@loopback/security';
import {User} from '../models';

export interface BackplaneUserProfile extends UserProfile, User {
}

const users: Map<string, User> = new Map();
createUser('did:ethr:0x08dddc705a29dfaa79ab1a0865b45c77a3c67a49', 'consumer provider');
createUser('fake:normalUser', '');
createUser('fake:consumer', 'consumer');
createUser('fake:provider', 'provider');
createUser('fake:consumerProvider', 'consumer provider');

export function findById(id: string): User | undefined {
  console.log(`Looking for user ${id}`);
  const user = users.get(id);
  return user ? Object.assign({}, user) : undefined;
}

export function createUser(id: string, scope: string): User {
  if (users.has(id)) {
    throw Error('User already exists');
  }
  console.log(`Create user ${id} with scopes [${scope}]`);
  const user = new User({
    id: id,
    scope: scope,
  });
  users.set(id, user);
  return Object.assign({}, user);
}

export function updateUser(id: string, scope: string): User {
  const user = users.get(id);
  if (!user) {
    throw Error('User does not exists');
  }
  user.scope = scope;
  return Object.assign({}, user);
}