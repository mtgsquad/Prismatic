import React, { Component } from "react";
import Navbar from "./Navbar";
import ProjectFileReader from "./ProjectFileReader";
import ProjectFile from "../Engine/projectFile";
import Button from "./Button";
import Canvas from "./Canvas";
import config from "../config";
import deviceConfigs from "../deviceConfigs";
import Select from 'react-select';

const options = [
  {
    name: "h",
    value: "h",
  },
];

class App extends Component {
  constructor(props) {
    super(props);

    if(navigator.requestMIDIAccess != undefined)
    {
      navigator.requestMIDIAccess().then(this.onMIDISuccess, this.onMIDIFailure);
    }
    else
    {
      alert("Your device doesn't support WebMidi")
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('unipack'))
    {
      var unipack_url = urlParams.get('unipack');
      alert("Downloading Unipack from " + unipack_url)
    }
  }

  state = {
    projectFile: undefined,
    projectName: "No project loaded",
    projectAuthor: "",

    midiInput: [],
    midiOutput: [],

    layoutConfigName: config.defaultLayout,
    layoutConfig: deviceConfigs[config.defaultLayout],

    inputDevice: undefined,
    inputConfigName: undefined,
    inputConfig: undefined,

    outputDevice: undefined,
    outputConfigName: undefined,
    outputConfig: undefined,
  };

  updateProjectFile = (projectPack) => {
    new ProjectFile(projectPack)
    .then((projectFile) => {this.setState({ projectFile: projectFile})})
    // .catch((message) => {alert(message)});
  };

  onMIDISuccess = (midiAccess) => {
    console.log("Got access your MIDI devices.");

    var midiInput = [];
    console.log("Input");
    for (var input of midiAccess.inputs.values()) {
      console.log(input.name);
      midiInput.push({label: input.name, value: input})
    }
    console.log(midiInput)
    this.setState({midiInput: midiInput})

    var midiOutput = [];
    console.log();
    console.log("Output");
    for (var output of midiAccess.outputs.values()) {
      console.log(output.name);
      midiOutput.push({label: output.name, value: output})
    }
    this.setState({midiOutput: midiOutput})

    midiAccess.onstatechange = this.onMidiStateChange
  };

  onMidiStateChange(e)
  {
    console.log(e);
    console.log(e.port.name, e.port.state);
    if(e.port.state === "connected")
    {
      if(e.port.type === "input")
      {
        var midiInput = this.state.midiInput
        midiInput.push({label: e.port.name, value: e.port})
        this.setState({midiInput: midiInput})
      }
      else if(e.port.type === "output")
      {
        var midiOutput = this.state.midiOutput
        midiOutput.push({label: e.port.name, value: e.port})
        this.setState({midiOutput: midiOutput})
      }
    }
    else if(e.port.state === "disconnected")
    {
      if(e.port.type === "input")
      {
        var midiInput = this.state.midiInput
        for(var i = 0; i < midiInput.length; i++)
        {
          if(midiInput[i].label === e.port.name)
          {
            midiInput.splice(i);
            break;
          }
        }
        this.setState({midiInput: midiInput})
        if(this.state.inputDevice.name === this.e.port.name)
        {
          this.setState({inputDevice: undefined})
          this.setState({inputDeviceConfig: undefined})
          this.setState({inputDeviceName: undefined})
        }
      }
      else if(e.port.type === "output")
      {
        var midiOutput = this.state.midiOutput
        for(var i = 0; i < midiOutput.length; i++)
        {
          if(midiOutput[i].label === e.port.name)
          {
            midiOutput.splice(i);
            break;
          }
        }
        this.setState({midiOutput: midiOutput})
        if(this.state.outputDevice.name === this.e.port.name)
        {
          this.setState({outputDevice: undefined})
          this.setState({outputDeviceConfig: undefined})
          this.setState({outputDeviceName: undefined})
        }
      }
    }
  }

  onMIDIFailure() {
    console.log("Could not access your MIDI devices.");
    alert("Could not access your MIDI devices. Try use another web browser or hardware platform")
  }
  
  autoConfigPicker(deviceName, mode) {//mode 0 for input, mode 1 for output
    if(deviceName !== undefined)
    {
      for(var key in deviceConfigs)
      {
        if (deviceName.match(deviceConfigs[key].midiNameRegex) !== null) {
          var config = deviceConfigs[key]
          console.log(`${mode ? "Output" : "input"} config has been auto assigned to ${key}`)
          switch(mode)
          {
            case 0:
              this.setState({inputConfigName: key});
              this.setState({inputConfig: config});
              return;
            case 1:
              this.setState({outputConfigName: key});
              this.setState({outputConfig: config});
              return;
          }
        }
      }
    }
    alert(`Unable to find matching ${mode ? "output" : "input"} config for device ${deviceName}`);
  }

  render() {
    return (
      <React.Fragment>
        <div className="main"> 
          <div className="toolbar"> {/* Not yet made */}
          <text>203 | Prismatic (Tech Preview Demo)</text>
          <div/>
          <text>{this.state.projectFile !== undefined ? `Current Project: ${this.state.projectFile.info["title"]} by ${this.state.projectFile.info["producerName"]}` : "No project loaded"}</text>
          <ProjectFileReader updateProjectFile={this.updateProjectFile}></ProjectFileReader>
          <div/>
          <text>UI Layout</text>
          <Select
            options={this.prepDeviceConfig()}
            autosize={true}
            value={this.state.layoutConfigName !== undefined ? {label: this.state.layoutConfigName, value: this.state.layoutConfig} : undefined}
            placeholder="Layout Config"
            onChange={this.setLayoutConfig.bind(this)}
          />
          <text>Midi Input Device</text>
          <Select
            options={this.state.midiInput}
            autosize={true}
            value={this.state.inputDevice !== undefined ? {label: this.state.inputDevice.name, value: this.state.inputDevice} : undefined}
            placeholder="Input Device"
            onChange={this.setInputDevice.bind(this)}
          />
          <text>Midi Input Device Config</text>
          <Select
            options={this.prepDeviceConfig()}
            autosize={true}
            value={this.state.inputConfigName !== undefined ? {label: this.state.inputConfigName, value: this.state.inputConfig} : undefined}
            placeholder="Input Device Config"
            onChange={this.setInputConfig.bind(this)}
          />
          <text>Midi Output Device</text>
          <Select
            options={this.state.midiOutput}
            autosize={true}
            value={this.state.outputDevice !== undefined ? {label: this.state.outputDevice.name, value: this.state.outputDevice} : undefined}
            placeholder="Output Device"
            onChange={this.setOutputDevice.bind(this)}
          />
          <text>Midi Output Device Config</text>
          <Select
            options={this.prepDeviceConfig()}
            autosize={true}
            value={this.state.outputConfigName !== undefined ? {label: this.state.outputConfigName, value: this.state.outputConfig} : undefined}
            placeholder="Output Device Config"
            onChange={this.setOutputConfig.bind(this)}
          />
          {/* <button>>Autoplay</button> */}
          </div>
          <div
            className="canvas"
            style={{
              padding: this.state.layoutConfig.padding,
              borderRadius: this.state.layoutConfig.radius,
            }}
          >
            <Canvas
              projectFile={this.state.projectFile}
              layoutConfig={this.state.layoutConfig}
              inputDevice={this.state.inputDevice}
              inputConfig={this.state.inputConfig}
              outputDevice={this.state.outputDevice}
              outputConfig={this.state.outputConfig}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }

  setLayoutConfig(config)
  {
    // console.log(config)
    this.setState({layoutConfigName: config.label});
    this.setState({layoutConfig: config.value});
  }

  setInputConfig(config)
  {
    // console.log(config)
    this.setState({inputConfigName: config.label});
    this.setState({inputConfig: config.value});
  }

  setOutputConfig(config)
  {
    // console.log(config)
    this.setState({outputConfigName: config.label});
    this.setState({outputConfig: config.value});
  }

  setInputDevice(device)
  {
    this.setState({inputDevice: device.value});
    this.autoConfigPicker(device.value.name, 0);
  }

  setOutputDevice(device)
  {
    // console.log("Output device set to " + device.name);
    this.setState({outputDevice: device.value});
    this.autoConfigPicker(device.value.name, 1);
  }

  prepDeviceConfig()
  { 
    var result=[];
    for (var key in deviceConfigs)
    {
      result.push({
        label: key,
        value: deviceConfigs[key],
      })
    }
    return result;
  }
}

export default App;
