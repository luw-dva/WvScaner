import { ServiceService } from './service.service';

export class ServiceMethod {
  constructor(private serviceService: ServiceService) { }

  getChildren(entId: string): any {
    const soapOpeartion = `GetChildEntities`;
    const soapParameters = `<entId>` + entId + `</entId>`;
    this.serviceService.soapGsCall(soapOpeartion, soapParameters);
  }

  getUsers(userId: string): any {
    const soapOpeartion = `ValidateUser`;
    const soapParameters = `<userId>` + userId + `</userId>`;
    this.serviceService.soapCall(soapOpeartion, soapParameters);
  }

  getUserData(entityId:string, userId:string): any {
    const soapOpeartion = `GetUserResult`;
    const soapParameters = `<entityId>` + entityId + `</entityId>
                            <worker>` + userId + `</worker>`;
    this.serviceService.soapCall(soapOpeartion, soapParameters);
  }

  getEntity(entityId: string): any {
    const soapOpeartion = `GetEntAndParentNameById`;
    const soapParameters = `<entId>` + entityId + `</entId>`;
    this.serviceService.soapCall(soapOpeartion, soapParameters);
  }

  getActiveLocksByWoOperation(wo: string, entParent: string): any {
    const soapOpeartion = `GetActiveLocksByWoOperation`;
    const soapParameters =
      `<wo>` + wo + `</wo>` +
      `<operation>` + entParent + `</operation>`;
    this.serviceService.soapQsCall(soapOpeartion, soapParameters);
  }

  confirmBundle(entId: string, bundle: string, entitiesParent: string, userName: string): any {
    const soapOpeartion = `ConfirmBundle`;
    const soapParameters =
      `<entityId>` +  entId +  `</entityId>` +
      `<bundle>` + bundle + `</bundle>` +
      `<operId>` + entitiesParent + `</operId>` +
      `<worker>` + userName + `</worker>`;
    this.serviceService.soapCall( soapOpeartion, soapParameters);
  }

  confirmOperation(entId: string, wo: string, entitiesParent: string, userName: string ): any {
    const soapOpeartion = `ConfirmOperation`;
    const soapParameters =
      `<entityId>` +  entId +  `</entityId>` +
      `<woId>` + wo + 'DDDUUPA' + `</woId>` +
      `<operId>` + entitiesParent + `</operId>` +
      `<worker>` + userName + `</worker>`;
    this.serviceService.soapCall(soapOpeartion, soapParameters);
  }

  getLocksSpecialItemsByWo(wo: string , entId: string): any {
    const soapOpeartion = `GetLocksSpecialItemsByWo`;
    const soapParameters =
      `<woId>` + wo + `</woId>` +
      `<entityId>` + entId + `</entityId>`;
    this.serviceService.soapCall(soapOpeartion, soapParameters);
  }
}
