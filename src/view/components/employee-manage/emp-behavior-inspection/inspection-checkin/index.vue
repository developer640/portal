<template>
  <div>
    <Card dis-hover>
      <div slot="title">
        <Form ref ="form" :model="formData" :label-width="80" inline>
          <FormItem label="排查项目" prop="prjId">
            <Select v-model="formData.prjId" style="width:400px" @on-change="handleSelectPrjChg" :disable="this.loadData">
              <Option v-for="item in this.selPrj" :value="item.key" :key="item.key">{{ item.value }}</Option>
            </Select>
          </FormItem>
          <FormItem label="" prop="closed" :label-width="0">
            <Select v-model="closed" style="width:100px" :disable="this.loadData" @on-change="handlePrjStatusChg">
              <Option :value="1">开展中</Option>
              <Option :value="0">已关闭</Option>
            </Select>
          </FormItem>
          <Button type="primary" icon="md-refresh" @click="getPrjectData" :disabled="this.loadData"></Button>
        </Form>
        <Input type="textarea" v-model="formData.describe" style="width: 95%;margin-left: 80px;margin-top: 10px;margin-bottom: 10px;" :rows="2" :autosize='{ minRows: 4, maxRows: 4 }' readonly></Input>
        <Form ref ="form1" :model="formData" :label-width="80" inline>
          <FormItem label="员工工号" prop="employeeNo">
            <Input type="text" v-model="formData.employeeNo" :readonly="this.loadData" style="width:100px;"></Input>
          </FormItem>
          <FormItem label="员工姓名" prop="employeeName">
            <Input type="text" v-model="formData.employeeName" :readonly="this.loadData" style="width:120px;">
              <Button slot="append" icon="md-apps" @click="handleSelectEmp" :disabled="this.loadData"></Button>
            </Input>
          </FormItem>
          <FormItem label="所属机构" prop="deptCode">
            <Cascader style="width: 270px" :data="dept_list" v-model="formData.deptCode" trigger="hover" :disabled="this.loadData"></Cascader>
          </FormItem>
        </Form>
        <Form ref ="form2" :model="formData" :label-width="80" inline>
          <FormItem label="排查状态" prop="checkStatus">
            <Select v-model="formData.checkStatus" style="width:100px" clearable :disable="this.loadData">
              <Option :value="0">待排查</Option>
              <Option :value="1">已排查</Option>
            </Select>
          </FormItem>
          <FormItem label="员工职务" prop="dutySeq" class="info_title">
            <Select v-model="formData.dutySeq" style="width: 480px;" :clearable="true" multiple :max-tag-count="2" :max-tag-placeholder="maxTagPlaceholder" :label-in-value="true" @on-change="handleDutySeqChg">
              <Option v-for="item in this.selOption.selDutySeq" :value="item.key" :key="item.key">{{ item.value }}</Option>
            </Select>
          </FormItem>
          <FormItem :label-width="0">
            <Checkbox :value="this.formData.dutySeq.length === this.selOption.selDutySeq.length ? true:false" @on-change="handleDutyCheck">全选</Checkbox>
          </FormItem>
          <ButtonGroup>
            <Button type="primary" icon="ios-search" @click="handleChgPageSize(pageData.size,1)" :loading="this.loadData">查询</Button>
            <Button type="primary" icon="ios-search" @click="handleInspectionCheckBatch" :loading="this.loadData" :disabled="this.closed === 0 || this.selCheckinRow.length <= 1">批量排查</Button>
            <Button type="primary" icon="ios-search" @click="handleAddNonEmp" :loading="this.loadData" :disabled="this.closed === 0">添加编外被排查人</Button>
            <Button type="success" icon="md-cloud-download" :disabled = "this.formData.prjId ? false: true"
              :to="downloadUrl + downloadPara" target="_blank"
              @click="handleDownloadList"
              :loading="this.downloading">导出</Button>
          </ButtonGroup>
        </Form>
      </div>

      <Table size="small" :height="windowHeight" :stripe="true" border ref="table" :loading="this.loadData" :columns="cols" :data="dataSet"
        @on-row-dblclick="handleInspectionCheck"
        @on-select="handleOnSelect"
        @on-select-cancel="handleOnSelectCancel"
        @on-select-all="handleOnSelectAll"
        @on-select-all-cancel="handleOnSelectAllCancel">
        <template slot-scope="{ row, index }" slot="action">
          <!-- <Button type="primary" size="small" :disabled="dataDealing || row.employeeNo != null" @click="handleModifyNonEmp (row, index)">修改</Button> -->
          <Poptip
            confirm
            title="你确认删除这条项目吗？"
            @on-ok="handleDeleteNonEmp (row, index)">
            <Button type="error" size="small" :disabled="closed === 0 || dataDealing || row.employeeNo != null">删除</Button>
          </Poptip>
        </template>
        <div slot="footer" style="width:100%;text-align: center">
          <span style="float: left;margin-left: 10px">双击任意记录，进入单个排查</span>
          <Page :total="pageData.total" :current.sync="pageData.current" :disabled="this.dataSet.length > 0 ? false: true"
            @on-change="handleSearchRd"
            @on-page-size-change="handleChgPageSize"
            :page-size-opts="[10, 20, 30, 40, 60, 80]"
            size="small" show-elevator show-sizer />
        </div>
      </Table>

      <Drawer title="选择员工" :closable="false" v-model="showSelectEmp" :transfer="false" inner placement="left">
        <Tree :data="deptEmpList" @on-select-change="handleInstChange"></Tree>
      </Drawer>
    </Card>

    <Modal v-model="showInspectionCheckin" :loading="dataSaving" scrollable title="排查登记" width="1000" ok-text="提交" :styles="{top: '10px'}"
      :mask-closable="false"
      :footer-hide="false"
      @on-ok="handleCheckSave">
      <InspectionCheckin @saveCancel="handleCheckCancel" @saveSuccess="handleCheckSuccess" :prjName="formData.prjName" :initFlag="initCheckinFlag" :saveNow="saveCheckin" :rowData="selCheckinRow" :prjId="formData.prjId"></InspectionCheckin>
    </Modal>

    <Modal v-model="showAddNonEmp" :loading="dataSaving" scrollable title="编外被排查人" width="700" ok-text="提交" :styles="{top: '10px'}"
      :mask-closable="false"
      :footer-hide="false"
      @on-ok="handleNonEmpSave">
      <AddNonEmp @saveCancel="handleNonEmpCancel" @saveSuccess="handleNonEmpSuccess" :saveNow="saveNonEmp" :rowData="selNonEmp" :actionType="actionType"></AddNonEmp>
    </Modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getInstEmpList, getInstList, getSingleSelectOptionData } from '@/api/base'
import { mixinInfo } from './common.js'
import { getEmpCheckProjectList, getEmpCheckRecordList, deleteOffStaffEmployee, getOffStaffEmployeeInfo } from '@/api/emp-manage/emp-behavior-inspection'
import { formatSelectOptionByDefine, formatSingleSelectOption } from '@/libs/j-tools.js'
import InspectionCheckin from '_c/emp-behavior-inspection/inspection-checkin'
import AddNonEmp from '_c/emp-behavior-inspection/add-non-employee'

export default {
  components: {
    InspectionCheckin,
    AddNonEmp
  },
  mixins: [ mixinInfo ],
  data () {
    return {
      pageData: {
        total: 0,
        current: 1,
        size: 10
      },
      formData: {
        prjId: undefined,
        prjName: '',
        describe: '',
        employeeNo: '',
        employeeName: '',
        checkStatus: undefined,
        deptCode: [],
        dutySeq: [],
        dutySeqText: []
      },
      nonEmpNewRow: {
        name: '',
        gender: undefined,
        idcardNo: '',
        remark: ''
      },
      selOption: { selDutySeq: [] },
      prjData: [],
      selPrj: [],
      dataSet: [],
      dept_list: [],
      deptEmpList: [],
      closed: 1,
      loadData: false,
      showSelectEmp: false,
      showAddNonEmp: false,
      showInspectionCheckin: false,
      dataSaving: true,
      dataDealing: false,
      saveCheckin: false,
      initCheckinFlag: false,
      saveNonEmp: false,
      selCheckinRow: [],
      selNonEmp: {},
      actionType: '', // view || create || modify
      windowHeight: 0,
      downloading: false,
      dutySWitch: false,
      downloadUrl: '',
      base_url: '',
      downloadPara: ''
    }
  },
  methods: {
    ...mapGetters([
      'deptCode',
      'employeeNo'
    ]),
    initInfo () {
      getSingleSelectOptionData({ type: 'EMP_DUTY' }).then(res => {
        if (res.data.code === '000000') {
          this.selOption.selDutySeq = formatSingleSelectOption(res.data.data)
        }
      }).catch(() => {

      })

      const condition = {
        employee: true
      }

      getInstEmpList(condition).then(res => {
        if (res.data.code === '000000') {
          this.deptEmpList = res.data.data
        }
      }).catch(() => {

      })

      getInstList().then(res => {
        if (res.data.code === '000000') {
          this.dept_list = res.data.data
        }
      }).catch(() => {

      })

      this.getPrjectData()
    },
    getPrjectData () {
      if (this.loadData) return
      this.loadData = true

      this.formData.prjId = undefined
      this.formData.describe = ''
      this.dataSet = []

      const condition = {
        status: this.closed === 1 ? 1 : 2
      }
      if (this.closed === 0) {
        condition.orderBy = 'project_close_time'
        condition.orderType = 'desc'
      }
      getEmpCheckProjectList(condition).then(res => {
        if (res.data.code === '000000') {
          this.prjData = res.data.data
          this.selPrj = formatSelectOptionByDefine(this.prjData, 'id', 'name')
        }
        this.loadData = false
      }).catch(() => {
        this.prjData = []
        this.selPrj = []
        this.loadData = false
      })
    },
    maxTagPlaceholder (num) {
      return '+' + num
    },
    handleDutySeqChg (item) {
      if (item) {
        this.formData.dutySeqText = item.map((v) => { return v.label })
      }
    },
    handleDutyCheck (v) {
      if (v) {
        this.formData.dutySeq = this.selOption.selDutySeq.map((v) => { return v.key })
      } else {
        this.formData.dutySeq = []
      }
    },
    handlePrjStatusChg (val) {
      this.getPrjectData()
    },
    handleOnSelect (sel, row) {
      this.selCheckinRow = sel
    },
    handleOnSelectCancel (sel, row) {
      this.selCheckinRow = sel
    },
    handleOnSelectAll (sel) {
      this.selCheckinRow = sel
    },
    handleOnSelectAllCancel (sel) {
      this.selCheckinRow = sel
    },
    handleSelectPrjChg (item) {
      if (item) {
        this.formData.describe = this.prjData.find((v) => v.id === item).describe
        this.formData.prjName = this.prjData.find((v) => v.id === item).name
        this.handleChgPageSize(this.pageData.size, 1)
      }
    },
    handleInspectionCheckBatch () {
      this.initCheckinFlag = true
      this.$nextTick(() => {
        this.initCheckinFlag = false
      })
      this.showInspectionCheckin = true
    },
    handleAddNonEmp () {
      if (!this.formData.prjId) {
        this.$Message.warning({
          content: '请选择一个排查项目！',
          duration: 5
        })
        return
      }

      this.actionType = 'create'
      this.selNonEmp = Object.assign({}, this.nonEmpNewRow)
      this.showAddNonEmp = true
    },
    handleInstChange (item) {
      if (item[0]) {
        item[0].expand = !item[0].expand
        item[0].selected = !item[0].selected

        if (item[0].is_emp) {
          this.formData.employeeName = item[0].title
          this.formData.employeeNo = item[0].num
          this.showSelectEmp = false
        }
      }
    },
    handleCheckSave () {
      this.saveCheckin = true
      this.$nextTick(() => {
        this.saveCheckin = false
      })
    },
    handleCheckCancel () {
      this.dataSaving = false
      this.$nextTick(() => {
        this.dataSaving = true
      })
    },
    handleCheckSuccess (rowData) {
      for (const elem of rowData.values()) {
        this.dataSet[elem.index].checkCount++
        this.dataSet[elem.index].checkStatus = 1
      }
      this.dataSaving = false
      this.showInspectionCheckin = false
      this.selCheckinRow = []
      this.$nextTick(() => {
        this.dataSaving = true
      })
    },
    handleNonEmpSave () {
      this.saveNonEmp = true
      this.$nextTick(() => {
        this.saveNonEmp = false
      })
    },
    handleNonEmpCancel () {
      this.dataSaving = false
      this.$nextTick(() => {
        this.dataSaving = true
      })
    },
    handleNonEmpSuccess (isNew, rowIndex, data) {
      if (isNew) {
        this.dataSet.push({
          index: this.dataSet.length,
          name: data.name,
          idcardNo: data.idcardNo,
          headSubName: data.headSubName,
          deptName: data.deptName,
          checkCount: 0,
          deptCode: this.deptCode(),
          checkStatus: 0
        })
      } else {
        this.dataSet[rowIndex].name = data.name
      }
      this.dataSaving = false
      this.showAddNonEmp = false
      this.$nextTick(() => {
        this.dataSaving = true
      })
    },
    handleChgPageSize (size, current) {
      if (!this.formData.prjId) {
        this.$Message.warning({
          content: '请选择一个排查项目！',
          duration: 5
        })
        return
      }

      if (current) this.pageData.current = current
      this.pageData.size = size
      this.$nextTick(() => {
        this.handleSearchRd()
      })
    },
    handleSearchRd () {
      if (this.loadData) return
      this.loadData = true

      this.formData.employeeNo = this.trimForText(this.formData.employeeNo).toUpperCase()
      this.formData.employeeName = this.trimForText(this.formData.employeeName)
      const condition = {
        projectId: this.formData.prjId,
        page: this.pageData.current,
        pageSize: this.pageData.size
      }
      if (this.formData.employeeNo !== '') {
        condition.employeeNo = this.formData.employeeNo
      }
      if (this.formData.employeeName !== '') {
        condition.name = this.formData.employeeName
      }
      if (this.formData.deptCode && this.formData.deptCode.length > 0) {
        condition.deptCode = this.formData.deptCode[this.formData.deptCode.length - 1]
      }
      if (this.formData.checkStatus || this.formData.checkStatus === 0) {
        condition.status = this.formData.checkStatus
      }
      if (this.formData.dutySeqText.length > 0) {
        condition.dutySeq = this.formData.dutySeqText
      }

      getEmpCheckRecordList(condition).then(res => {
        if (res.data.code === '000000') {
          let self = res.data.data.rows.find((v) => v.employeeNo === this.employeeNo())
          if (self) {
            self._disabled = true
          }

          this.dataSet = res.data.data.rows
          this.pageData.total = res.data.data.total
          let index = 0
          for (let elem of this.dataSet.values()) {
            elem.index = index
            index++
          }
        }
        this.loadData = false
      }).catch(() => {
        this.dataSet = []
        this.loadData = false
      })
    },
    handleInspectionCheck (row, index) {
      if (this.closed === 0) return
      if (row.employeeNo === this.employeeNo()) {
        this.$Message.warning({
          content: '不能对自已进行排查！',
          duration: 5
        })
        return
      }

      this.$refs.table.selectAll(false) // 取消所有已选择
      this.selCheckinRow = [row]
      this.initCheckinFlag = true
      this.$nextTick(() => {
        this.initCheckinFlag = false
      })
      this.showInspectionCheckin = true
    },
    handleModifyNonEmp (row, index) {
      getOffStaffEmployeeInfo({ idcardNo: row.idcardNo }).then(res => {
        if (res.data.code === '000000') {
          this.actionType = 'modify'
          this.selNonEmp = Object.assign({}, {
            _index: index,
            id: res.data.data.id,
            name: res.data.data.name,
            gender: res.data.data.gender,
            idcardNo: res.data.data.idcardNo,
            remark: res.data.data.remark
          })
          this.showAddNonEmp = true
        }
      }).catch(() => {

      })
    },
    handleDeleteNonEmp (row, index) {
      this.dataDealing = true
      const condition = {
        idcardNo: row.idcardNo,
        deptCode: row.deptCode,
        name: row.name
      }

      deleteOffStaffEmployee(condition).then(res => {
        if (res.data.code === '000000') {
          this.$Message.success({
            content: '删除数据成功！',
            duration: 3
          })
          this.dataSet.splice(index, 1)
        }

        this.dataDealing = false
      }).catch(() => {
        this.dataDealing = false
      })
    },
    handleSelectEmp () {
      this.showSelectEmp = true
    },
    handleDownloadList () {
      if (this.downloading) return
      this.downloading = true

      this.formData.employeeNo = this.trimForText(this.formData.employeeNo).toUpperCase()
      this.formData.employeeName = this.trimForText(this.formData.employeeName)

      this.downloadPara = `projectId=${this.formData.prjId}`
      if (this.formData.employeeNo !== '') {
        this.downloadPara = `${this.downloadPara}&employeeNo=${this.formData.employeeNo}`
      }
      if (this.formData.employeeName !== '') {
        this.downloadPara = `${this.downloadPara}&employeeName=${this.formData.employeeName}`
      }

      if (this.formData.deptCode && this.formData.deptCode.length > 0) {
        this.downloadPara = `${this.downloadPara}&deptCode=${this.formData.deptCode[this.formData.deptCode.length - 1]}`
      }
      if (this.formData.checkStatus || this.formData.checkStatus === 0) {
        this.downloadPara = `${this.downloadPara}&status=${this.formData.checkStatus}`
      }
      if (this.formData.dutySeqText.length > 0) {
        this.downloadPara = `${this.downloadPara}&dutySeq=${this.formData.dutySeqText.map((v) => { return v }).join('&dutySeq=')}`
      }

      this.$Message.info({
        content: '正在生成数据，请稍候......',
        duration: 5
      })

      setTimeout(() => {
        this.downloading = false
      }, 5000)
    },
    setWindowHeight () {
      this.windowHeight = window.innerHeight - 380
    }
  },
  activated () {
    this.getPrjectData()
  },
  mounted () {
    this.base_url = (process.env.NODE_ENV === 'production' ? this.$config.baseUrl.pro : this.$config.baseUrl.dev)
    this.downloadUrl = this.base_url + 'empcheckrecords/tocheck/export?'
    this.initInfo()
  },
  created () {
    window.addEventListener('resize', this.setWindowHeight)
    this.setWindowHeight()
  },
  destroyed () {
    window.removeEventListener('resize', this.setWindowHeight)
  }
}
</script>

<style scoped>
  .ivu-form-item{
    margin-bottom: 0px;
  }
</style>
