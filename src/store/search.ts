import {observable} from "mobx";

class SearchStore {
    @observable
    public searchList: any[] = []


}
const searchStore = new SearchStore();
export default searchStore;
