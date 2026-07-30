
# Default VPC ko select karein
resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}


resource "aws_key_pair" "my_key" {
  key_name   = "my-ssh-key"
  # Yahan apni public key (.pub file) ka path dein ya direct string paste karein
  public_key = file("../terrakey.pub") 
}
# EC2 ke liye Security Group banayein (SSH allow karne ke liye)
resource "aws_security_group" "ec2_sg" {
  name        = "ec2-default-vpc-sg"
  description = "Allow SSH traffic"
  vpc_id      = aws_default_vpc.default.id # Default VPC ki ID yahan use hogi

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Security ke liye ismein apna IP dalein
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance launch karein
resource "aws_instance" "my_ec2" {
  ami           = "ami-01a00762f46d584a1" # Isko apne region ke Ubuntu/Amazon Linux AMI se badlein
  instance_type = "t3.xlarge"

  key_name  = aws_key_pair.my_key.key_name

  # Security group ko attach karein
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]


  root_block_device {
    volume_size           = 20      # Size GB mein (8 se lekar jitna aapko chahiye)
    volume_type           = "gp3"   # gp3 naya aur behtar performace deta hai
    delete_on_termination = true    # Instance delete hone par storage bhi delete ho jaye
  }

  tags = {
    Name = "Terraform-EC2-DefaultVPC"
  }
}
