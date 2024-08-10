class BytebeatExtension {
    constructor() {
      this.audioCtx = null;
      this.source = null;
      this._isPlaying = false;  // Track the sound state, can be true, false, or "error"
    }
  
    getInfo() {
      return {
        id: 'bytebeat',
        name: 'Bytebeat',
        blocks: [
          {
            opcode: 'generateSound',
            blockType: Scratch.BlockType.COMMAND,
            text: 'Generate a Bytebeat with [FORMULA] at [SAMPLE_RATE] Hz for [DURATION] seconds',
            arguments: {
              FORMULA: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: '(((t>>12^(t>>12)-2)%11*t/4|t>>6)&127)'
              },
              SAMPLE_RATE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 44100
              },
              DURATION: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 60
              }
            }
          },
          {
            opcode: 'stopSound',
            blockType: Scratch.BlockType.COMMAND,
            text: 'stop sound'
          },
          {
            opcode: 'isPlaying',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is sound playing?'
          }
        ]
      };
    }
  
    generateSound(args) {
      const formula = args.FORMULA;
      const sampleRate = args.SAMPLE_RATE;
      const duration = args.DURATION;
      let t = 0;
  
      try {
        // If there's an existing sound, stop it first
        if (this.source) {
          this.source.stop();
        }
  
        // Create a new AudioContext
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const bufferLength = sampleRate * duration;
        const buffer = this.audioCtx.createBuffer(1, bufferLength, sampleRate);
        const output = buffer.getChannelData(0);
  
        for (let i = 0; i < bufferLength; i++) {
          try {
            // Evaluate the formula with Math and other functions available
            output[i] = (Function("t", "Math", "return " + formula))(t, Math) % 256 / 128 - 1;
          } catch (e) {
            output[i] = 0;  // In case of an error in the formula, output silence
          }
          t++;
        }
  
        // Create a new AudioBufferSourceNode
        this.source = this.audioCtx.createBufferSource();
        this.source.buffer = buffer;
        this.source.connect(this.audioCtx.destination);
  
        // Start the sound
        this.source.loop = true;  // Loop the sound for continuous playback
        this.source.start();
  
        this._isPlaying = true;  // Set _isPlaying to true
        this.source.onended = () => {
          this._isPlaying = false;  // Reset _isPlaying when the sound ends
        };
      } catch (error) {
        console.error("Error generating sound:", error);
        this._isPlaying = "error";  // Set _isPlaying to "error" on failure
      }
    }
  
    stopSound() {
      if (this.source) {
        this.source.stop();
        this.source = null;  // Clear the reference after stopping
        this._isPlaying = false;  // Set _isPlaying to false when sound is stopped
      }
    }
  
    isPlaying() {
      return this._isPlaying;  // Return the current state of _isPlaying
    }
  }
  
  Scratch.extensions.register(new BytebeatExtension());
  